"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMCostEvaluate = void 0;
class LLMCostEvaluate {
    constructor(usdToRubRate = 100) {
        this.models = [];
        this.OPENROUTER_API_URL = "https://openrouter.ai/api/v1/models";
        this.usdToRubRate = usdToRubRate;
    }
    async initialize() {
        try {
            console.log("🔄 Loading OpenRouter Models...");
            const response = await fetch(this.OPENROUTER_API_URL);
            if (!response.ok) {
                throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
            }
            const data = (await response.json());
            this.models = data.data;
            console.log(`✅ Loaded ${this.models.length} OpenRouter models`);
        }
        catch (error) {
            console.error("❌ Failed to load OpenRouter Models:", error);
            throw error;
        }
    }
    getAllModels() {
        return this.models;
    }
    calculateCost(cost) {
        return cost * this.usdToRubRate * 2;
    }
    getModelsWithRubPricing(searchTerm, provider) {
        let filteredModels = this.models;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredModels = filteredModels.filter((model) => model.name.toLowerCase().includes(term) ||
                model.id.toLowerCase().includes(term) ||
                model.description.toLowerCase().includes(term));
        }
        if (provider) {
            filteredModels = filteredModels.filter((model) => model.id.toLowerCase().includes(provider.toLowerCase()));
        }
        return filteredModels.map((model) => ({
            ...model,
            pricing: {
                prompt: this.calculateCost(parseFloat(model.pricing.prompt)),
                completion: this.calculateCost(parseFloat(model.pricing.completion)),
                request: this.calculateCost(parseFloat(model.pricing.request)),
                image: this.calculateCost(parseFloat(model.pricing.image)),
                web_search: this.calculateCost(parseFloat(model.pricing.web_search)),
                internal_reasoning: this.calculateCost(parseFloat(model.pricing.internal_reasoning)),
                input_cache_read: model.pricing.input_cache_read
                    ? this.calculateCost(parseFloat(model.pricing.input_cache_read))
                    : undefined,
                input_cache_write: model.pricing.input_cache_write
                    ? this.calculateCost(parseFloat(model.pricing.input_cache_write))
                    : undefined,
            },
        }));
    }
    getModelsByProviders(providers) {
        return this.getModelsWithRubPricing().filter((model) => providers.some((provider) => model.id.toLowerCase().startsWith(`${provider.toLowerCase()}/`)));
    }
    getPopularProviderModels() {
        const popularProviders = [
            "x-ai",
            "deepseek",
            "google",
            "qwen",
            "perplexity",
            "mistralai",
            "openai",
            "anthropic",
        ];
        return this.getModelsByProviders(popularProviders).filter((model) => !model.id.toLowerCase().includes(":free"));
    }
}
exports.LLMCostEvaluate = LLMCostEvaluate;
