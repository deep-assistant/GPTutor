import { FastifyRequest, FastifyReply } from "fastify";
import { BaseController } from "./BaseController";
import { LLMCostEvaluate } from "../services/LLMCostEvaluate";
import { RequestWithLogging } from "../middleware/loggingMiddleware";
import {
  createRateLimitMiddleware,
  getRateLimitConfig,
} from "../middleware/rateLimitMiddleware";

export class ModelsController extends BaseController {
  constructor(protected fastify: any, private llmCostService: LLMCostEvaluate) {
    super(fastify);
  }

  registerRoutes(): void {
    // Rate limiting для Models endpoint
    const modelsRateLimit = createRateLimitMiddleware(
      getRateLimitConfig("/v1/models")!
    );

    this.fastify.get(
      "/v1/models",
      { preHandler: modelsRateLimit },
      this.getModels.bind(this)
    );
  }

  private async getModels(request: FastifyRequest, reply: FastifyReply) {
    try {
      this.logInfo(
        "Getting popular provider Models",
        {},
        request as RequestWithLogging
      );

      // Проверяем, что сервис инициализирован
      const allModels = this.llmCostService.getAllModels();
      if (!allModels || allModels.length === 0) {
        this.logWarn(
          "LLM Cost Service not initialized or no Models loaded",
          {},
          request as RequestWithLogging
        );
        return this.sendError(
          reply,
          "Models service not ready",
          503,
          request as RequestWithLogging
        );
      }

      const models = this.llmCostService.getPopularProviderModels();

      // Проверяем, что модели загружены корректно
      if (!models || models.length === 0) {
        this.logWarn(
          "No Models found from popular providers",
          {},
          request as RequestWithLogging
        );

        return this.sendSuccess(reply, {
          success: true,
          data: {
            models: [],
            total: 0,
            providers: [
              "x-ai",
              "deepseek",
              "google",
              "qwen",
              "perplexity",
              "mistralai",
              "openai",
              "anthropic",
            ],
            lastUpdated: new Date().toISOString(),
          },
        });
      }

      this.logInfo(
        `Found ${models.length} models from popular providers`,
        {
          modelCount: models.length,
          sampleModel: models[0]
            ? {
                id: models[0].id,
                hasPricingRub: !!models[0].pricing_rub,
                hasPrompt: !!models[0].pricing_rub?.prompt,
              }
            : null,
        },
        request as RequestWithLogging
      );

      const sortedModels = models.sort((a, b) => {
        // Безопасное получение цены с проверкой на существование
        const priceA = a.pricing_rub?.prompt || 0;
        const priceB = b.pricing_rub?.prompt || 0;

        // Сначала сравниваем по цене (самые дорогие сверху)
        const priceDiff = priceB - priceA;
        if (priceDiff !== 0) {
          return priceDiff;
        }

        // Если цены равны, сравниваем по дате создания (самые новые сверху)
        const createdA = a.created || 0;
        const createdB = b.created || 0;
        return createdB - createdA;
      });

      this.logInfo(
        `Retrieved ${sortedModels.length} popular models (sorted by price and creation date)`,
        {
          modelCount: sortedModels.length,
        },
        request as RequestWithLogging
      );

      return this.sendSuccess(reply, {
        success: true,
        data: {
          models: sortedModels,
          total: sortedModels.length,
          providers: [
            "x-ai",
            "deepseek",
            "google",
            "qwen",
            "perplexity",
            "mistralai",
            "openai",
            "anthropic",
          ],
          lastUpdated: new Date().toISOString(),
        },
      });
    } catch (error) {
      this.logError(
        "Failed to get Models",
        error,
        {},
        request as RequestWithLogging
      );
      return this.sendError(
        reply,
        "Failed to retrieve Models",
        500,
        request as RequestWithLogging
      );
    }
  }
}
