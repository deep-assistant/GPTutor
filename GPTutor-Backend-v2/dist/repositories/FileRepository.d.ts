import { PrismaClient } from "@prisma/client";
export declare class FileRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: {
        userId: string;
        type: string;
        name: string;
        url: string;
        size: number;
        originalName?: string;
        originalSize?: number;
        converted?: boolean;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        url: string;
        size: number;
        notStatic: boolean;
        originalName: string | null;
        originalSize: number | null;
        converted: boolean;
        userId: string;
    }>;
    findById(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        url: string;
        size: number;
        notStatic: boolean;
        originalName: string | null;
        originalSize: number | null;
        converted: boolean;
        userId: string;
    } | null>;
    findByUserId(userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        url: string;
        size: number;
        notStatic: boolean;
        originalName: string | null;
        originalSize: number | null;
        converted: boolean;
        userId: string;
    }[]>;
    delete(id: string): Promise<void>;
    update(id: string, data: {
        name?: string;
        type?: string;
        url?: string;
        size?: number;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        url: string;
        size: number;
        notStatic: boolean;
        originalName: string | null;
        originalSize: number | null;
        converted: boolean;
        userId: string;
    }>;
    findByUrl(url: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        url: string;
        size: number;
        notStatic: boolean;
        originalName: string | null;
        originalSize: number | null;
        converted: boolean;
        userId: string;
    } | null>;
    getFileStats(userId: string): Promise<{
        totalFiles: number;
        totalSize: number;
        filesByType: Record<string, number>;
    }>;
    /**
     * Находит файлы старше указанной даты
     */
    findOlderThan(date: Date): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        url: string;
        size: number;
        notStatic: boolean;
        originalName: string | null;
        originalSize: number | null;
        converted: boolean;
        userId: string;
    }[]>;
    /**
     * Находит файл по названию и размеру
     */
    findByNameAndSize(name: string, size: number): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        url: string;
        size: number;
        notStatic: boolean;
        originalName: string | null;
        originalSize: number | null;
        converted: boolean;
        userId: string;
    } | null>;
    /**
     * Находит файл по оригинальному названию и размеру
     * Используется для поиска конвертированных файлов по их оригинальным данным
     */
    findByOriginalNameAndSize(originalName: string, originalSize: number): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        url: string;
        size: number;
        notStatic: boolean;
        originalName: string | null;
        originalSize: number | null;
        converted: boolean;
        userId: string;
    } | null>;
    findByNameAndSizeOrOriginal(name: string, size: number): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        url: string;
        size: number;
        notStatic: boolean;
        originalName: string | null;
        originalSize: number | null;
        converted: boolean;
        userId: string;
    } | null>;
}
