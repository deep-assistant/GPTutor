"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRepository = void 0;
class FileRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.file.create({
            data: {
                userId: data.userId,
                type: data.type,
                name: data.name,
                url: data.url,
                size: data.size,
                originalName: data.originalName,
                originalSize: data.originalSize,
                converted: data.converted || false,
            },
        });
    }
    async findById(id) {
        return this.prisma.file.findUnique({
            where: { id },
        });
    }
    async findByUserId(userId) {
        return this.prisma.file.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
    async delete(id) {
        await this.prisma.file.delete({
            where: { id },
        });
    }
    async update(id, data) {
        return this.prisma.file.update({
            where: { id },
            data,
        });
    }
    async findByUrl(url) {
        return this.prisma.file.findFirst({
            where: { url },
        });
    }
    async getFileStats(userId) {
        const files = await this.prisma.file.findMany({
            where: { userId },
            select: {
                type: true,
                size: true,
            },
        });
        const totalFiles = files.length;
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        const filesByType = files.reduce((acc, file) => {
            const type = file.type.split("/")[0]; // Получаем основной тип (image, application, etc.)
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        return {
            totalFiles,
            totalSize,
            filesByType,
        };
    }
    /**
     * Находит файлы старше указанной даты
     */
    async findOlderThan(date) {
        return this.prisma.file.findMany({
            where: {
                createdAt: {
                    lt: date,
                },
            },
        });
    }
    /**
     * Находит файл по названию и размеру
     */
    async findByNameAndSize(name, size) {
        return this.prisma.file.findFirst({
            where: {
                name,
                size,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    /**
     * Находит файл по оригинальному названию и размеру
     * Используется для поиска конвертированных файлов по их оригинальным данным
     */
    async findByOriginalNameAndSize(originalName, originalSize) {
        return this.prisma.file.findFirst({
            where: {
                originalName,
                originalSize,
                converted: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async findByNameAndSizeOrOriginal(name, size) {
        const byCurrentData = await this.findByNameAndSize(name, size);
        if (byCurrentData) {
            return byCurrentData;
        }
        return await this.findByOriginalNameAndSize(name, size);
    }
}
exports.FileRepository = FileRepository;
