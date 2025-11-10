import {
  OpenRouterModel,
  OpenRouterApiResponse,
  CostCalculation,
  UsageParams,
} from "../types/openrouter";

interface ExchangeRateResponse {
  rates: {
    [key: string]: number;
  };
  base: string;
  date: string;
}

export class LLMCostEvaluate {
  private models: OpenRouterModel[] = [];
  private usdToRubRate: number;
  private readonly OPENROUTER_API_URL = "https://openrouter.ai/api/v1/models";
  private readonly EXCHANGE_RATE_API_URL =
    "https://api.exchangerate-api.com/v4/latest/USD";
  private readonly UPDATE_INTERVAL_MS = 60 * 60 * 1000;
  private updateIntervalId?: NodeJS.Timeout;

  constructor(usdToRubRate: number = 100) {
    this.usdToRubRate = usdToRubRate;
  }

  private async fetchExchangeRate(): Promise<void> {
    try {
      console.log("🔄 Fetching USD to RUB exchange rate...");

      const response = await fetch(this.EXCHANGE_RATE_API_URL);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch exchange rate: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as ExchangeRateResponse;
      const rate = data.rates?.RUB;

      if (rate && typeof rate === "number") {
        const rateWithMarkup = rate * 1.17;
        this.usdToRubRate = rateWithMarkup;
        console.log(
          `✅ Updated USD to RUB rate: ${rate.toFixed(
            2
          )} → ${rateWithMarkup.toFixed(2)} (with 17% markup)`
        );
      } else {
        throw new Error("Invalid exchange rate data received");
      }
    } catch (error) {
      console.error(
        "❌ Failed to fetch exchange rate, using fallback value 100:",
        error
      );
      this.usdToRubRate = 100;
    }
  }

  private startExchangeRateUpdates(): void {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
    }

    this.updateIntervalId = setInterval(() => {
      this.fetchExchangeRate();
    }, this.UPDATE_INTERVAL_MS);

    console.log(
      `⏰ Exchange rate will update every ${
        this.UPDATE_INTERVAL_MS / 1000 / 60
      } minutes`
    );
  }

  async initialize(): Promise<void> {
    try {
      console.log("🔄 Loading OpenRouter Models...");

      await this.fetchExchangeRate();

      this.startExchangeRateUpdates();

      const response = await fetch(this.OPENROUTER_API_URL);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch models: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as OpenRouterApiResponse;
      this.models = data.data;

      console.log(`✅ Loaded ${this.models.length} OpenRouter models`);
    } catch (error) {
      console.error("❌ Failed to load OpenRouter Models:", error);
      throw error;
    }
  }

  getAllModels(): OpenRouterModel[] {
    return this.models;
  }

  calculateCost(cost: number): number {
    return cost * this.usdToRubRate;
  }

  getModelsWithRubPricing(searchTerm?: string, provider?: string): any[] {
    let filteredModels = this.models;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredModels = filteredModels.filter(
        (model) =>
          model.name.toLowerCase().includes(term) ||
          model.id.toLowerCase().includes(term) ||
          model.description.toLowerCase().includes(term)
      );
    }

    if (provider) {
      filteredModels = filteredModels.filter((model) =>
        model.id.toLowerCase().includes(provider.toLowerCase())
      );
    }

    return filteredModels.map((model) => ({
      ...model,
      pricing: {
        prompt: this.calculateCost(parseFloat(model.pricing.prompt)),
        completion: this.calculateCost(parseFloat(model.pricing.completion)),
        request: this.calculateCost(parseFloat(model.pricing.request)),
        image: this.calculateCost(parseFloat(model.pricing.image)),
        web_search: this.calculateCost(parseFloat(model.pricing.web_search)),
        internal_reasoning: this.calculateCost(
          parseFloat(model.pricing.internal_reasoning)
        ),
        input_cache_read: model.pricing.input_cache_read
          ? this.calculateCost(parseFloat(model.pricing.input_cache_read))
          : undefined,
        input_cache_write: model.pricing.input_cache_write
          ? this.calculateCost(parseFloat(model.pricing.input_cache_write))
          : undefined,
      },
    }));
  }

  getModelsByProviders(providers: string[]): any[] {
    return this.getModelsWithRubPricing()
      .filter((model) =>
        providers.some((provider) =>
          model.id.toLowerCase().startsWith(`${provider.toLowerCase()}/`)
        )
      )
      .filter((model) => model.id !== "openai/o1-pro");
  }

  getPopularProviderModels(): any[] {
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

    return this.getModelsByProviders(popularProviders).filter(
      (model) => !model.id.toLowerCase().includes(":free")
    );
  }

  // Метод для остановки обновлений курса (для корректной очистки ресурсов)
  stopExchangeRateUpdates(): void {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
      this.updateIntervalId = undefined;
      console.log("🛑 Exchange rate updates stopped");
    }
  }

  // Геттер для получения текущего курса
  getCurrentExchangeRate(): number {
    return this.usdToRubRate;
  }
}
