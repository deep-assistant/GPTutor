import { PrismaClient, UsageRecord } from "@prisma/client";
export interface CreateUsageRecordData {
    userId: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costRub: number;
    costUsd?: number;
    duration: number;
    stream?: boolean;
    requestId?: string;
    messagesCount?: number;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
}
export interface UsageRecordFilters {
    userId?: string;
    model?: string;
    startDate?: Date;
    endDate?: Date;
    stream?: boolean;
}
export interface PaginationOptions {
    page: number;
    limit: number;
    sortBy?: 'createdAt' | 'costRub' | 'totalTokens';
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedUsageRecords {
    records: UsageRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class UsageRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateUsageRecordData): Promise<UsageRecord>;
    findPaginated(filters: UsageRecordFilters | undefined, pagination: PaginationOptions): Promise<PaginatedUsageRecords>;
    getUsageStats(userId?: string, startDate?: Date, endDate?: Date): Promise<{
        totalRequests: number;
        totalTokens: number;
        totalCostRub: number;
        totalCostUsd: number;
        averageDuration: number;
        modelsUsed: Array<{
            model: string;
            requests: number;
            tokens: number;
            costRub: number;
        }>;
    }>;
    findByRequestId(requestId: string): Promise<UsageRecord | null>;
    deleteOldRecords(olderThan: Date): Promise<number>;
}
