import { FastifyReply } from "fastify";
import { BaseController } from "./BaseController";
import { UserRepository } from "../repositories/UserRepository";
import { LLMCostEvaluate } from "../services/LLMCostEvaluate";
import { OpenRouterService } from "../services/OpenRouterService";
import { RequestWithLogging } from "../middleware/loggingMiddleware";
import { logger } from "../services/LoggerService";
import { authenticateUser } from "../utils/vkAuth";
import {
  createRateLimitMiddleware,
  getRateLimitConfig,
} from "../middleware/rateLimitMiddleware";

interface CompletionRequest extends RequestWithLogging {
  body: {
    model?: string;
    messages: Array<{
      role: "system" | "user" | "assistant";
      content:
        | string
        | Array<{
            type: "text" | "image_url" | "file";
            text?: string;
            image_url?: {
              url: string;
              detail?: "low" | "high" | "auto";
            };
            file?: {
              filename: string;
              file_data: string;
              mimeType?: string;
            };
          }>;
    }>;
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    stop?: string[];
    stream?: boolean;
  };
}

export class CompletionController extends BaseController {
  constructor(
    fastify: any,
    private userRepository: UserRepository,
    private llmCostService: LLMCostEvaluate,
    private openRouterService: OpenRouterService,
    private vkSecretKey: string = process.env.VK_SECRET_KEY || ""
  ) {
    super(fastify);
  }

  registerRoutes(): void {
    const completionsRateLimit = createRateLimitMiddleware(
      getRateLimitConfig("/v1/chat/completions")!
    );

    this.fastify.post(
      "/v1/chat/completions",
      { preHandler: completionsRateLimit },
      this.chatCompletions.bind(this)
    );
  }

  private async chatCompletions(request: any, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;

      const authResult = await authenticateUser(
        authHeader,
        this.vkSecretKey,
        this.userRepository
      );

      if (!authResult) {
        return this.sendUnauthorized(
          reply,
          "Invalid authentication. Use Bearer token (sk-...) or VK authorization.",
          request
        );
      }

      let user;
      let userId;

      if (authResult.authType === "api_key") {
        user = authResult.user;
        userId = user.id.toString();
      } else if (authResult.authType === "vk") {
        const vkData = authResult.user;
        let dbUser = await this.userRepository.findByVkId(vkData.vk_user_id);

        if (!dbUser) {
          dbUser = await this.userRepository.create({
            vkId: vkData.vk_user_id,
            isActive: true,
          });
        }

        user = dbUser;
        userId = user.id.toString();
      } else {
        return this.sendUnauthorized(
          reply,
          "Unknown authentication type",
          request
        );
      }

      if (!user.isActive) {
        return this.sendUnauthorized(
          reply,
          "User account is inactive",
          request
        );
      }

      if (user.balance <= 0) {
        this.logInfo(
          "Insufficient balance",
          {
            userId: user.id,
            balance: user.balance,
          },
          request
        );

        return this.sendInsufficientBalance(reply, request);
      }

      request.userId = userId;

      const requestBody = request.body;
      if (!requestBody.messages || !Array.isArray(requestBody.messages)) {
        return this.sendValidationError(
          reply,
          "messages array is required",
          request
        );
      }

      const model = requestBody.model || "google/gemini-2.5-flash-lite";

      const hasFiles = this.hasFilesInMessages(requestBody.messages);

      this.logInfo(
        `LLM request initiated`,
        {
          model,
          messagesCount: requestBody.messages.length,
          stream: requestBody.stream || false,
          hasFiles,
        },
        request
      );

      //todo добавить отнимание баланса
      const openRouterParams = {
        model,
        messages: requestBody.messages,
        max_tokens: requestBody.max_tokens,
        temperature: requestBody.temperature,
        top_p: requestBody.top_p,
        frequency_penalty: requestBody.frequency_penalty,
        presence_penalty: requestBody.presence_penalty,
        stop: requestBody.stop,
        ...(hasFiles && {
          plugins: [
            {
              id: "file-parser",
              pdf: {
                engine: "native",
              },
            },
          ],
        }),
      };

      if (requestBody.stream) {
        return this.handleStreamingResponse(
          reply,
          user,
          model,
          openRouterParams,
          request
        );
      }

      return this.handleNonStreamingResponse(
        reply,
        user,
        openRouterParams,
        request
      );
    } catch (error) {
      this.logError("Completion API error", error, {}, request);

      if (error instanceof Error) {
        if (error.message === "User not found") {
          return this.sendUnauthorized(reply, "Invalid API key", request);
        }
        if (error.message === "Insufficient balance") {
          return this.sendInsufficientBalance(reply, request);
        }
      }

      return this.sendError(reply, "Internal server error", 500, request);
    }
  }

  private async handleStreamingResponse(
    reply: FastifyReply,
    user: any,
    model: string,
    openRouterParams: any,
    request: CompletionRequest
  ) {
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("X-Accel-Buffering", "no");
    reply.raw.setHeader("Access-Control-Allow-Origin", "*");
    reply.raw.setHeader("Content-type", "text/event-stream");

    let totalCost = 0;

    try {
      logger.llmRequest(model, user.id.toString(), undefined, undefined, {
        requestId: request.requestId,
        stream: true,
      });

      const streamStartTime = Date.now();

      const stream = await this.openRouterService.createCompletionStream({
        ...openRouterParams,
        stream: true,
      });

      let chunkCount = 0;

      for await (const chunk of stream) {
        chunkCount++;

        if (chunk.usage) {
          const responseUsage = chunk.usage as any;
          console.log({ usage: chunk.usage as any });
          const cost = this.llmCostService.calculateCost(responseUsage?.cost);
          totalCost = cost;

          chunk.usage = {
            prompt_tokens: responseUsage?.prompt_tokens,
            completion_tokens: responseUsage?.completion_tokens,
            total_tokens: responseUsage?.total_tokens,
            cost,
          } as any;
        }

        const chunkData = `data: ${JSON.stringify(chunk)}\n\n`;
        reply.raw.write(chunkData);

        if (chunkCount % 50 === 0) {
          this.logDebug(
            `Streaming progress: ${chunkCount} chunks sent`,
            {},
            request
          );
        }
      }

      reply.raw.write("data: [DONE]\n\n");

      reply.raw.end();

      const streamDuration = Date.now() - streamStartTime;

      logger.llmResponse(
        model,
        user.id.toString(),
        0,
        totalCost,
        streamDuration,
        {
          requestId: request.requestId,
          chunks: chunkCount,
          stream: true,
        }
      );

      await this.userRepository.decreaseBalance(user.id, totalCost);

      return;
    } catch (streamError) {
      this.logError("Stream error", streamError, { model }, request);

      try {
        reply.raw.write(
          `data: ${JSON.stringify({
            error: "Stream error",
            message:
              streamError instanceof Error
                ? streamError.message
                : "Unknown error",
          })}\n\n`
        );
        reply.raw.write("data: [DONE]\n\n");
        reply.raw.end();
      } catch (writeError) {
        this.logError(
          "Error writing error response to stream",
          writeError,
          {},
          request
        );
      }

      return;
    }
  }

  private async handleNonStreamingResponse(
    reply: FastifyReply,
    user: any,
    openRouterParams: any,
    request: CompletionRequest
  ) {
    const requestStartTime = Date.now();

    logger.llmRequest(
      openRouterParams.model,
      user.id.toString(),
      undefined,
      undefined,
      {
        requestId: request.requestId,
        stream: false,
      }
    );

    const completion = await this.openRouterService.createCompletion({
      ...openRouterParams,
      stream: false,
    });

    console.log(completion);
    const responseUsage = completion.usage;
    console.log({ usage: responseUsage });
    const originalCostUsd = (completion.usage as any)?.cost;
    const cost = this.llmCostService.calculateCost(originalCostUsd);
    const requestDuration = Date.now() - requestStartTime;
    const totalTokens = (completion.usage as any)?.total_tokens || 0;

    await this.userRepository.decreaseBalance(user.id, cost);

    const updatedUser =
      (await this.userRepository.findByVkId(user.vkId || "")) ||
      (await this.userRepository.findByApiKey(
        request.headers.authorization?.substring(7) || ""
      ));

    logger.llmResponse(
      openRouterParams.model,
      user.id.toString(),
      totalTokens,
      cost,
      requestDuration,
      {
        requestId: request.requestId,
        originalCostUsd,
        remainingBalance: updatedUser?.balance,
      }
    );

    logger.balance(
      "decrease",
      user.id.toString(),
      cost,
      updatedUser?.balance || 0,
      {
        requestId: request.requestId,
        reason: "llm_completion",
      }
    );

    const responseWithCost = {
      ...completion,
      usage: {
        prompt_tokens: responseUsage?.prompt_tokens,
        completion_tokens: responseUsage?.completion_tokens,
        total_tokens: responseUsage?.total_tokens,
        cost,
      },
    };

    return this.sendSuccess(reply, responseWithCost);
  }

  /**
   * Проверяет наличие файлов в сообщениях
   */
  private hasFilesInMessages(
    messages: Array<{
      role: "system" | "user" | "assistant";
      content:
        | string
        | Array<{
            type: "text" | "image_url" | "file";
            text?: string;
            image_url?: {
              url: string;
              detail?: "low" | "high" | "auto";
            };
            file?: {
              filename: string;
              file_data: string;
              mimeType?: string;
            };
          }>;
    }>
  ): boolean {
    return messages.some((message) => {
      // Если content это строка, файлов нет
      if (typeof message.content === "string") {
        return false;
      }

      // Если content это массив, проверяем каждый элемент
      if (Array.isArray(message.content)) {
        return message.content.some(
          (contentItem) =>
            contentItem.type === "image_url" || contentItem.type === "file"
        );
      }

      return false;
    });
  }
}
