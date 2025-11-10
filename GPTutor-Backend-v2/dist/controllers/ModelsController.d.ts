import { BaseController } from "./BaseController";
import { LLMCostEvaluate } from "../services/LLMCostEvaluate";
export declare class ModelsController extends BaseController {
    protected fastify: any;
    private llmCostService;
    constructor(fastify: any, llmCostService: LLMCostEvaluate);
    registerRoutes(): void;
    private getModels;
}
