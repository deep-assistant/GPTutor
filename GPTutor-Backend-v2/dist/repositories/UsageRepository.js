"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageRepository = void 0;
class UsageRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.usageRecord.create({
            data: {
                userId: data.userId,
                model: data.model,
                promptTokens: data.promptTokens,
                completionTokens: data.completionTokens,
                totalTokens: data.totalTokens,
                costRub: data.costRub,
                costUsd: data.costUsd,
                duration: data.duration,
                stream: data.stream ?? false,
                requestId: data.requestId,
                messagesCount: data.messagesCount,
                temperature: data.temperature,
                maxTokens: data.maxTokens,
                topP: data.topP,
                frequencyPenalty: data.frequencyPenalty,
                presencePenalty: data.presencePenalty,
            },
        });
    }
    async findPaginated(filters = {}, pagination) {
        const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters.userId) {
            where.userId = filters.userId;
        }
        if (filters.model) {
            where.model = filters.model;
        }
        if (filters.stream !== undefined) {
            where.stream = filters.stream;
        }
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.createdAt.lte = filters.endDate;
            }
        }
        const [records, total] = await Promise.all([
            this.prisma.usageRecord.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            vkId: true,
                        },
                    },
                },
            }),
            this.prisma.usageRecord.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            records,
            total,
            page,
            limit,
            totalPages,
        };
    }
    async getUsageStats(userId, startDate, endDate) {
        const where = {};
        if (userId) {
            where.userId = userId;
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = startDate;
            }
            if (endDate) {
                where.createdAt.lte = endDate;
            }
        }
        const [totalRequests, totalTokens, totalCostRub, totalCostUsd, averageDuration, modelStats,] = await Promise.all([
            this.prisma.usageRecord.count({ where }),
            this.prisma.usageRecord.aggregate({
                where,
                _sum: { totalTokens: true },
            }),
            this.prisma.usageRecord.aggregate({
                where,
                _sum: { costRub: true },
            }),
            this.prisma.usageRecord.aggregate({
                where,
                _sum: { costUsd: true },
            }),
            this.prisma.usageRecord.aggregate({
                where,
                _avg: { duration: true },
            }),
            this.prisma.usageRecord.groupBy({
                by: ['model'],
                where,
                _count: { model: true },
                _sum: {
                    totalTokens: true,
                    costRub: true,
                },
            }),
        ]);
        const modelsUsed = modelStats.map((stat) => ({
            model: stat.model,
            requests: stat._count.model,
            tokens: stat._sum.totalTokens || 0,
            costRub: stat._sum.costRub || 0,
        }));
        return {
            totalRequests,
            totalTokens: totalTokens._sum.totalTokens || 0,
            totalCostRub: totalCostRub._sum.costRub || 0,
            totalCostUsd: totalCostUsd._sum.costUsd || 0,
            averageDuration: Math.round(averageDuration._avg.duration || 0),
            modelsUsed,
        };
    }
    async findByRequestId(requestId) {
        return this.prisma.usageRecord.findFirst({
            where: { requestId },
        });
    }
    async deleteOldRecords(olderThan) {
        const result = await this.prisma.usageRecord.deleteMany({
            where: {
                createdAt: {
                    lt: olderThan,
                },
            },
        });
        return result.count;
    }
}
exports.UsageRepository = UsageRepository;
