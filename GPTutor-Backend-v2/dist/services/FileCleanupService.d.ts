import { PrismaClient } from "@prisma/client";
import { FilesService } from "./FilesService";
/**
 * Сервис для автоматической очистки старых файлов
 */
export declare class FileCleanupService {
    private prisma;
    private filesService;
    private cleanupInterval;
    private readonly FILE_LIFETIME_HOURS;
    private readonly CLEANUP_INTERVAL_MS;
    constructor(prisma: PrismaClient, filesService: FilesService);
    /**
     * Запускает автоматическую очистку файлов
     */
    start(): void;
    /**
     * Останавливает автоматическую очистку файлов
     */
    stop(): void;
    /**
     * Выполняет очистку старых файлов
     */
    private cleanupOldFiles;
    /**
     * Вычисляет возраст файла в часах
     */
    private getFileAge;
    /**
     * Ручная очистка старых файлов (для вызова из API или CLI)
     */
    cleanupNow(): Promise<{
        success: boolean;
        message: string;
        stats?: {
            total: number;
            success: number;
            errors: number;
        };
    }>;
}
