"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
class UserRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateApiKey() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "sk-";
        for (let i = 0; i < 48; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    async findByVkId(vkId) {
        return this.prisma.user.findUnique({
            where: { vkId },
        });
    }
    async create(data) {
        return this.prisma.user.create({
            data: {
                vkId: data.vkId,
                balance: data.balance,
                isActive: data.isActive ?? true,
                apiKey: this.generateApiKey(),
            },
        });
    }
    async findByApiKey(apiKey) {
        return this.prisma.user.findUnique({
            where: { apiKey },
        });
    }
    async updateBalance(userId, newBalance) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { balance: newBalance },
        });
    }
    async decreaseBalance(userId, amount) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error("User not found");
        }
        const newBalance = user.balance - amount;
        if (newBalance < 0) {
            throw new Error("Insufficient balance");
        }
        return this.updateBalance(userId, newBalance);
    }
    async updateApiKey(userId) {
        const newApiKey = this.generateApiKey();
        return this.prisma.user.update({
            where: { id: userId },
            data: { apiKey: newApiKey },
        });
    }
}
exports.UserRepository = UserRepository;
