"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelsController = void 0;
const BaseController_1 = require("./BaseController");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
class ModelsController extends BaseController_1.BaseController {
    constructor(fastify, llmCostService) {
        super(fastify);
        this.fastify = fastify;
        this.llmCostService = llmCostService;
    }
    registerRoutes() {
        // Rate limiting для Models endpoint
        const modelsRateLimit = (0, rateLimitMiddleware_1.createRateLimitMiddleware)((0, rateLimitMiddleware_1.getRateLimitConfig)("/v1/models"));
        this.fastify.get("/v1/models", { preHandler: modelsRateLimit }, this.getModels.bind(this));
    }
    async getModels(request, reply) {
        try {
            this.logInfo("Getting popular provider Models", {}, request);
            // Проверяем, что сервис инициализирован
            const allModels = this.llmCostService.getAllModels();
            if (!allModels || allModels.length === 0) {
                this.logWarn("LLM Cost Service not initialized or no Models loaded", {}, request);
                return this.sendError(reply, "Models service not ready", 503, request);
            }
            const models = this.llmCostService.getPopularProviderModels();
            // Проверяем, что модели загружены корректно
            if (!models || models.length === 0) {
                this.logWarn("No Models found from popular providers", {}, request);
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
            this.logInfo(`Found ${models.length} models from popular providers`, {
                modelCount: models.length,
                sampleModel: models[0]
                    ? {
                        id: models[0].id,
                        hasPricingRub: !!models[0].pricing_rub,
                        hasPrompt: !!models[0].pricing_rub?.prompt,
                    }
                    : null,
            }, request);
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
            this.logInfo(`Retrieved ${sortedModels.length} popular models (sorted by price and creation date)`, {
                modelCount: sortedModels.length,
            }, request);
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
        }
        catch (error) {
            this.logError("Failed to get Models", error, {}, request);
            return this.sendError(reply, "Failed to retrieve Models", 500, request);
        }
    }
}
exports.ModelsController = ModelsController;
