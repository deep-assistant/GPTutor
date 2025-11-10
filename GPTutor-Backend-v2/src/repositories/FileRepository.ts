import { PrismaClient } from "@prisma/client";

export class FileRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: {
    userId: string;
    type: string;
    name: string;
    url: string;
    size: number;
    originalName?: string;
    originalSize?: number;
    converted?: boolean;
  }) {
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

  async findById(id: string) {
    return this.prisma.file.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.file.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.file.delete({
      where: { id },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      type?: string;
      url?: string;
      size?: number;
    }
  ) {
    return this.prisma.file.update({
      where: { id },
      data,
    });
  }

  async findByUrl(url: string) {
    return this.prisma.file.findFirst({
      where: { url },
    });
  }

  async getFileStats(userId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
  }> {
    const files = await this.prisma.file.findMany({
      where: { userId },
      select: {
        type: true,
        size: true,
      },
    });

    const totalFiles = files.length;
    const totalSize = files.reduce(
      (sum: number, file: any) => sum + file.size,
      0
    );

    const filesByType = files.reduce(
      (acc: Record<string, number>, file: any) => {
        const type = file.type.split("/")[0]; // Получаем основной тип (image, application, etc.)
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalFiles,
      totalSize,
      filesByType,
    };
  }

  /**
   * Находит файлы старше указанной даты
   */
  async findOlderThan(date: Date) {
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
  async findByNameAndSize(name: string, size: number) {
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
  async findByOriginalNameAndSize(originalName: string, originalSize: number) {
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

  async findByNameAndSizeOrOriginal(name: string, size: number) {
    const byCurrentData = await this.findByNameAndSize(name, size);
    if (byCurrentData) {
      return byCurrentData;
    }

    return await this.findByOriginalNameAndSize(name, size);
  }
}
