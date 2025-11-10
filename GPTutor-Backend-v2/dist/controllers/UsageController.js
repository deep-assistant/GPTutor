"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageController = void 0;
const BaseController_1 = require("./BaseController");
const universalAuthMiddleware_1 = require("../middleware/universalAuthMiddleware");
class UsageController extends BaseController_1.BaseController {
    constructor(fastify, usageRepository, userRepository, vkSecretKey = process.env.VK_SECRET_KEY || "") {
        super(fastify);
        this.usageRepository = usageRepository;
        this.userRepository = userRepository;
        this.vkSecretKey = vkSecretKey;
    }
    registerRoutes() {
        const authMiddleware = (0, universalAuthMiddleware_1.createUniversalAuthMiddleware)(this.userRepository, this.vkSecretKey);
        this.fastify.get("/v1/usage", { preHandler: authMiddleware }, this.getUsageList.bind(this));
        this.fastify.get("/v1/usage/stats", { preHandler: authMiddleware }, this.getUsageStats.bind(this));
    }
    async getUsageList(request, reply) {
        try {
            const userId = (0, universalAuthMiddleware_1.getUserId)(request);
            // Парсинг параметров
            const query = request.query;
            const page = parseInt(query.page || "1");
            const limit = Math.min(parseInt(query.limit || "20"), 100); // максимум 100 записей
            const sortBy = query.sortBy || 'createdAt';
            const sortOrder = query.sortOrder || 'desc';
            // Фильтры - пользователь может видеть только свои записи
            const filters = {
                userId: userId,
            };
            if (query.model) {
                filters.model = query.model;
            }
            if (query.stream !== undefined) {
                filters.stream = query.stream === 'true';
            }
            if (query.startDate) {
                filters.startDate = new Date(query.startDate);
            }
            if (query.endDate) {
                filters.endDate = new Date(query.endDate);
            }
            const pagination = {
                page,
                limit,
                sortBy,
                sortOrder,
            };
            const result = await this.usageRepository.findPaginated(filters, pagination);
            this.logInfo(`Usage list requested`, {
                userId,
                page,
                limit,
                totalRecords: result.total,
                filters,
            }, request);
            return this.sendSuccess(reply, {
                records: result.records.map((record) => ({
                    id: record.id,
                    model: record.model,
                    promptTokens: record.promptTokens,
                    completionTokens: record.completionTokens,
                    totalTokens: record.totalTokens,
                    costRub: record.costRub,
                    costUsd: record.costUsd,
                    duration: record.duration,
                    stream: record.stream,
                    requestId: record.requestId,
                    messagesCount: record.messagesCount,
                    temperature: record.temperature,
                    maxTokens: record.maxTokens,
                    topP: record.topP,
                    frequencyPenalty: record.frequencyPenalty,
                    presencePenalty: record.presencePenalty,
                    createdAt: record.createdAt,
                    user: record.user,
                })),
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages,
                },
            });
        }
        catch (error) {
            this.logError("Usage list error", error, {}, request);
            if (error instanceof Error) {
                if (error.message === "User not authenticated") {
                    return this.sendUnauthorized(reply, "Authentication required", request);
                }
            }
            return this.sendError(reply, "Internal server error", 500, request);
        }
    }
    async getUsageStats(request, reply) {
        try {
            const userId = (0, universalAuthMiddleware_1.getUserId)(request);
            const query = request.query;
            // Пользователь может видеть только свою статистику
            const targetUserId = userId;
            const startDate = query.startDate ? new Date(query.startDate) : undefined;
            const endDate = query.endDate ? new Date(query.endDate) : undefined;
            const stats = await this.usageRepository.getUsageStats(targetUserId, startDate, endDate);
            this.logInfo(`Usage stats requested`, {
                userId,
                targetUserId,
                startDate,
                endDate,
                totalRequests: stats.totalRequests,
            }, request);
            return this.sendSuccess(reply, stats);
        }
        catch (error) {
            this.logError("Usage stats error", error, {}, request);
            if (error instanceof Error) {
                if (error.message === "User not authenticated") {
                    return this.sendUnauthorized(reply, "Authentication required", request);
                }
            }
            return this.sendError(reply, "Internal server error", 500, request);
        }
    }
}
exports.UsageController = UsageController;
