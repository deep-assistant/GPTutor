import { OpenRouterModel } from "../types/openrouter";
export declare class LLMCostEvaluate {
    private models;
    private usdToRubRate;
    private readonly OPENROUTER_API_URL;
    constructor(usdToRubRate?: number);
    initialize(): Promise<void>;
    getAllModels(): OpenRouterModel[];
    calculateCost(cost: number): number;
    getModelsWithRubPricing(searchTerm?: string, provider?: string): any[];
    getModelsByProviders(providers: string[]): any[];
    getPopularProviderModels(): any[];
}
