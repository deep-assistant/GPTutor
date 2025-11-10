import { BaseController } from "./BaseController";
import { UserRepository } from "../repositories/UserRepository";
import { LLMCostEvaluate } from "../services/LLMCostEvaluate";
import { OpenRouterService } from "../services/OpenRouterService";
export declare class CompletionController extends BaseController {
    private userRepository;
    private llmCostService;
    private openRouterService;
    private vkSecretKey;
    constructor(fastify: any, userRepository: UserRepository, llmCostService: LLMCostEvaluate, openRouterService: OpenRouterService, vkSecretKey?: string);
    registerRoutes(): void;
    private chatCompletions;
    private handleStreamingResponse;
    private handleNonStreamingResponse;
    /**
     * Проверяет наличие файлов в сообщениях
     */
    private hasFilesInMessages;
}
