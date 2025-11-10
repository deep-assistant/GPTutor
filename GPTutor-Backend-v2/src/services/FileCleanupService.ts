import { PrismaClient } from "@prisma/client";
import { logger } from "./LoggerService";
import { FilesService } from "./FilesService";

/**
 * Сервис для автоматической очистки старых файлов
 */
export class FileCleanupService {
  private prisma: PrismaClient;
  private filesService: FilesService;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly FILE_LIFETIME_HOURS = 20;
  private readonly CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

  constructor(prisma: PrismaClient, filesService: FilesService) {
    this.prisma = prisma;
    this.filesService = filesService;
  }

  /**
   * Запускает автоматическую очистку файлов
   */
  start(): void {
    logger.info("Starting file cleanup service", {
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
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logger.info("File cleanup service stopped");
    }
  }

  /**
   * Выполняет очистку старых файлов
   */
  private async cleanupOldFiles(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - this.FILE_LIFETIME_HOURS);

      logger.info("Starting file cleanup", {
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
        logger.info("No old files to cleanup");
        return;
      }

      logger.info(`Found ${oldFiles.length} old files to cleanup`, {
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

          logger.info("File cleaned up successfully", {
            fileId: file.id,
            fileName: file.name,
            userId: file.userId,
            age: this.getFileAge(file.createdAt),
          });
        } catch (error) {
          errorCount++;
          logger.error("Failed to cleanup file", error, {
            fileId: file.id,
            fileName: file.name,
            url: file.url,
          });
        }
      }

      logger.info("File cleanup completed", {
        totalFiles: oldFiles.length,
        successCount,
        errorCount,
        cutoffDate: cutoffDate.toISOString(),
      });
    } catch (error) {
      logger.error("File cleanup failed", error);
    }
  }

  /**
   * Вычисляет возраст файла в часах
   */
  private getFileAge(createdAt: Date): string {
    const now = new Date();
    const ageMs = now.getTime() - createdAt.getTime();
    const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
    const ageMinutes = Math.floor((ageMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${ageHours}h ${ageMinutes}m`;
  }

  /**
   * Ручная очистка старых файлов (для вызова из API или CLI)
   */
  async cleanupNow(): Promise<{
    success: boolean;
    message: string;
    stats?: { total: number; success: number; errors: number };
  }> {
    try {
      await this.cleanupOldFiles();
      return {
        success: true,
        message: "Cleanup completed successfully",
      };
    } catch (error) {
      logger.error("Manual cleanup failed", error);
      return {
        success: false,
        message: "Cleanup failed",
      };
    }
  }
}
