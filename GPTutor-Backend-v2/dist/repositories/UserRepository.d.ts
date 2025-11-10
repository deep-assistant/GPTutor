import { PrismaClient, User } from "@prisma/client";
export declare class UserRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    private generateApiKey;
    findByVkId(vkId: string): Promise<User | null>;
    create(data: {
        vkId: string;
        balance?: number;
        isActive?: boolean;
    }): Promise<User>;
    findByApiKey(apiKey: string): Promise<User | null>;
    updateBalance(userId: string, newBalance: number): Promise<User>;
    decreaseBalance(userId: string, amount: number): Promise<User>;
    updateApiKey(userId: string): Promise<User>;
}
