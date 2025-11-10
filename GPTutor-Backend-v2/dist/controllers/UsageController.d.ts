import { BaseController } from "./BaseController";
import { UsageRepository } from "../repositories/UsageRepository";
import { UserRepository } from "../repositories/UserRepository";
export declare class UsageController extends BaseController {
    private usageRepository;
    private userRepository;
    private vkSecretKey;
    constructor(fastify: any, usageRepository: UsageRepository, userRepository: UserRepository, vkSecretKey?: string);
    registerRoutes(): void;
    private getUsageList;
    private getUsageStats;
}
