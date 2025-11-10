import { S3 } from "aws-sdk";
export declare class FilesService {
    private getExtension;
    private getFileWithExtension;
    /**
     * Проверяет, нужна ли конвертация файла в PDF
     */
    private needsConversionToPdf;
    /**
     * Конвертирует документ в PDF с помощью LibreOffice (через libreoffice-convert)
     * Работает напрямую с буферами без создания временных файлов
     */
    private convertToPdf;
    private optimizePhotos;
    private optimizeAttachment;
    private determineFileType;
    uploadFile(arrayBuffer: ArrayBuffer | string | Buffer | Uint8Array, name: string): Promise<S3.ManagedUpload.SendData>;
    optimizeAndUploadFile(arrayBuffer: ArrayBuffer, fileName: string): Promise<{
        url: string;
        optimizedData: ArrayBuffer | Buffer | string | Uint8Array;
        finalFileName: string;
    }>;
    /**
     * Удаляет файл из S3 по URL
     */
    deleteFile(fileUrl: string): Promise<void>;
}
