"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletionController = void 0;
const BaseController_1 = require("./BaseController");
const LoggerService_1 = require("../services/LoggerService");
const vkAuth_1 = require("../utils/vkAuth");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
class CompletionController extends BaseController_1.BaseController {
    constructor(fastify, userRepository, llmCostService, openRouterService, vkSecretKey = process.env.VK_SECRET_KEY || "") {
        super(fastify);
        this.userRepository = userRepository;
        this.llmCostService = llmCostService;
        this.openRouterService = openRouterService;
        this.vkSecretKey = vkSecretKey;
    }
    registerRoutes() {
        const completionsRateLimit = (0, rateLimitMiddleware_1.createRateLimitMiddleware)((0, rateLimitMiddleware_1.getRateLimitConfig)("/v1/chat/completions"));
        this.fastify.post("/v1/chat/completions", { preHandler: completionsRateLimit }, this.chatCompletions.bind(this));
    }
    async chatCompletions(request, reply) {
        try {
            const authHeader = request.headers.authorization;
            const authResult = await (0, vkAuth_1.authenticateUser)(authHeader, this.vkSecretKey, this.userRepository);
            console.log({ authResult });
            if (!authResult) {
                return this.sendUnauthorized(reply, "Invalid authentication. Use Bearer token (sk-...) or VK authorization.", request);
            }
            let user;
            let userId;
            if (authResult.authType === "api_key") {
                user = authResult.user;
                userId = user.id.toString();
            }
            else if (authResult.authType === "vk") {
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
            }
            else {
                return this.sendUnauthorized(reply, "Unknown authentication type", request);
            }
            if (!user.isActive) {
                return this.sendUnauthorized(reply, "User account is inactive", request);
            }
            // Проверяем баланс пользователя
            if (user.balance <= 0) {
                this.logInfo("Insufficient balance", {
                    userId: user.id,
                    balance: user.balance,
                }, request);
                return this.sendInsufficientBalance(reply, request);
            }
            console.log({ user });
            request.userId = userId;
            const requestBody = request.body;
            if (!requestBody.messages || !Array.isArray(requestBody.messages)) {
                return this.sendValidationError(reply, "messages array is required", request);
            }
            const model = requestBody.model || "google/gemini-2.5-flash-lite";
            const hasFiles = this.hasFilesInMessages(requestBody.messages);
            this.logInfo(`LLM request initiated`, {
                model,
                messagesCount: requestBody.messages.length,
                stream: requestBody.stream || false,
                hasFiles,
            }, request);
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
                return this.handleStreamingResponse(reply, user, model, openRouterParams, request);
            }
            return this.handleNonStreamingResponse(reply, user, openRouterParams, request);
        }
        catch (error) {
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
    async handleStreamingResponse(reply, user, model, openRouterParams, request) {
        reply.raw.setHeader("Cache-Control", "no-cache");
        reply.raw.setHeader("Connection", "keep-alive");
        reply.raw.setHeader("X-Accel-Buffering", "no");
        reply.raw.setHeader("Access-Control-Allow-Origin", "*");
        reply.raw.setHeader("Content-type", "text/event-stream");
        let totalCost = 0;
        try {
            LoggerService_1.logger.llmRequest(model, user.id.toString(), undefined, undefined, {
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
                    const responseUsage = chunk.usage;
                    console.log({ usage: chunk.usage });
                    const cost = this.llmCostService.calculateCost(responseUsage?.cost);
                    totalCost = cost;
                    chunk.usage = {
                        prompt_tokens: responseUsage?.prompt_tokens,
                        completion_tokens: responseUsage?.completion_tokens,
                        total_tokens: responseUsage?.total_tokens,
                        cost,
                    };
                }
                const chunkData = `data: ${JSON.stringify(chunk)}\n\n`;
                reply.raw.write(chunkData);
                if (chunkCount % 50 === 0) {
                    this.logDebug(`Streaming progress: ${chunkCount} chunks sent`, {}, request);
                }
            }
            reply.raw.write("data: [DONE]\n\n");
            reply.raw.end();
            const streamDuration = Date.now() - streamStartTime;
            LoggerService_1.logger.llmResponse(model, user.id.toString(), 0, totalCost, streamDuration, {
                requestId: request.requestId,
                chunks: chunkCount,
                stream: true,
            });
            await this.userRepository.decreaseBalance(user.id, totalCost);
            return;
        }
        catch (streamError) {
            this.logError("Stream error", streamError, { model }, request);
            try {
                reply.raw.write(`data: ${JSON.stringify({
                    error: "Stream error",
                    message: streamError instanceof Error
                        ? streamError.message
                        : "Unknown error",
                })}\n\n`);
                reply.raw.write("data: [DONE]\n\n");
                reply.raw.end();
            }
            catch (writeError) {
                this.logError("Error writing error response to stream", writeError, {}, request);
            }
            return;
        }
    }
    async handleNonStreamingResponse(reply, user, openRouterParams, request) {
        const requestStartTime = Date.now();
        LoggerService_1.logger.llmRequest(openRouterParams.model, user.id.toString(), undefined, undefined, {
            requestId: request.requestId,
            stream: false,
        });
        const completion = await this.openRouterService.createCompletion({
            ...openRouterParams,
            stream: false,
        });
        console.log(completion);
        const responseUsage = completion.usage;
        console.log({ usage: responseUsage });
        const originalCostUsd = completion.usage?.cost;
        const cost = this.llmCostService.calculateCost(originalCostUsd);
        const requestDuration = Date.now() - requestStartTime;
        const totalTokens = completion.usage?.total_tokens || 0;
        await this.userRepository.decreaseBalance(user.id, cost);
        const updatedUser = (await this.userRepository.findByVkId(user.vkId || "")) ||
            (await this.userRepository.findByApiKey(request.headers.authorization?.substring(7) || ""));
        LoggerService_1.logger.llmResponse(openRouterParams.model, user.id.toString(), totalTokens, cost, requestDuration, {
            requestId: request.requestId,
            originalCostUsd,
            remainingBalance: updatedUser?.balance,
        });
        LoggerService_1.logger.balance("decrease", user.id.toString(), cost, updatedUser?.balance || 0, {
            requestId: request.requestId,
            reason: "llm_completion",
        });
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
    hasFilesInMessages(messages) {
        return messages.some((message) => {
            // Если content это строка, файлов нет
            if (typeof message.content === "string") {
                return false;
            }
            // Если content это массив, проверяем каждый элемент
            if (Array.isArray(message.content)) {
                return message.content.some((contentItem) => contentItem.type === "image_url" || contentItem.type === "file");
            }
            return false;
        });
    }
}
exports.CompletionController = CompletionController;
