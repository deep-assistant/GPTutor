"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileCleanupService = void 0;
const LoggerService_1 = require("./LoggerService");
/**
 * Сервис для автоматической очистки старых файлов
 */
class FileCleanupService {
    constructor(prisma, filesService) {
        this.cleanupInterval = null;
        this.FILE_LIFETIME_HOURS = 20;
        this.CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
        this.prisma = prisma;
        this.filesService = filesService;
    }
    /**
     * Запускает автоматическую очистку файлов
     */
    start() {
        LoggerService_1.logger.info("Starting file cleanup service", {
            lifetimeHours: this.FILE_LIFETIME_HOURS,
            checkIntervalMinutes: this.CLEANUP_INTERVAL_MS / (60 * 1000),
        });
        this.cleanupOldFiles();
        this.cleanupInterval = setInterval(() => {
            this.cleanupOldFiles();
        }, this.CLEANUP_INTERVAL_MS);
    }
    /**
     * Останавливает автоматическую очистку файлов
     */
    stop() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            LoggerService_1.logger.info("File cleanup service stopped");
        }
    }
    /**
     * Выполняет очистку старых файлов
     */
    async cleanupOldFiles() {
        try {
            const cutoffDate = new Date();
            cutoffDate.setHours(cutoffDate.getHours() - this.FILE_LIFETIME_HOURS);
            LoggerService_1.logger.info("Starting file cleanup", {
                cutoffDate: cutoffDate.toISOString(),
                lifetimeHours: this.FILE_LIFETIME_HOURS,
            });
            const oldFiles = await this.prisma.file.findMany({
                where: {
                    createdAt: {
                        lt: cutoffDate,
                    },
                },
            });
            if (oldFiles.length === 0) {
                LoggerService_1.logger.info("No old files to cleanup");
                return;
            }
            LoggerService_1.logger.info(`Found ${oldFiles.length} old files to cleanup`, {
                fileIds: oldFiles.map((f) => f.id),
            });
            let successCount = 0;
            let errorCount = 0;
            // Удаляем каждый файл
            for (const file of oldFiles) {
                try {
                    // Удаляем только запись из БД (файл остается в S3)
                    await this.prisma.file.delete({
                        where: { id: file.id },
                    });
                    successCount++;
                    LoggerService_1.logger.info("File cleaned up successfully", {
                        fileId: file.id,
                        fileName: file.name,
                        userId: file.userId,
                        age: this.getFileAge(file.createdAt),
                    });
                }
                catch (error) {
                    errorCount++;
                    LoggerService_1.logger.error("Failed to cleanup file", error, {
                        fileId: file.id,
                        fileName: file.name,
                        url: file.url,
                    });
                }
            }
            LoggerService_1.logger.info("File cleanup completed", {
                totalFiles: oldFiles.length,
                successCount,
                errorCount,
                cutoffDate: cutoffDate.toISOString(),
            });
        }
        catch (error) {
            LoggerService_1.logger.error("File cleanup failed", error);
        }
    }
    /**
     * Вычисляет возраст файла в часах
     */
    getFileAge(createdAt) {
        const now = new Date();
        const ageMs = now.getTime() - createdAt.getTime();
        const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
        const ageMinutes = Math.floor((ageMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${ageHours}h ${ageMinutes}m`;
    }
    /**
     * Ручная очистка старых файлов (для вызова из API или CLI)
     */
    async cleanupNow() {
        try {
            await this.cleanupOldFiles();
            return {
                success: true,
                message: "Cleanup completed successfully",
            };
        }
        catch (error) {
            LoggerService_1.logger.error("Manual cleanup failed", error);
            return {
                success: false,
                message: "Cleanup failed",
            };
        }
    }
}
exports.FileCleanupService = FileCleanupService;
