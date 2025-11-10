import sharp from "sharp";
import { compress } from "compress-pdf";
//@ts-ignore
import EasyYandexS3 from "easy-yandex-s3";
import crypto from "crypto";
import { S3 } from "aws-sdk";
import { logger } from "./LoggerService";
//@ts-ignore
import libre from "libreoffice-convert";
import { promisify } from "util";

// Используем extend для callback, чтобы избежать deprecation warning
const libreConvert = promisify(libre.convert.bind(libre));

const s3 = new EasyYandexS3({
  auth: {
    accessKeyId: process.env.YANDEX_ACCESS_KEY_ID!,
    secretAccessKey: process.env.YANDEX_SECRET_ACCESS_KEY!,
  },
  httpOptions: {
    timeout: 60000,
  },
  Bucket: process.env.YANDEX_BUCKET!,
  debug: process.env.NODE_ENV === "development",
});

export class FilesService {
  private getExtension(fileName: string): string {
    const splitFileName = fileName.split(".");
    return splitFileName[splitFileName.length - 1].toLowerCase();
  }

  private getFileWithExtension(name: string, originalFileName: string): string {
    return `${name}.${this.getExtension(originalFileName)}`;
  }

  /**
   * Проверяет, нужна ли конвертация файла в PDF
   */
  private needsConversionToPdf(fileName: string): boolean {
    const extension = this.getExtension(fileName);
    const convertibleExtensions = ["doc", "docx", "ppt", "pptx"];
    return convertibleExtensions.includes(extension);
  }

  /**
   * Конвертирует документ в PDF с помощью LibreOffice (через libreoffice-convert)
   * Работает напрямую с буферами без создания временных файлов
   */
  private async convertToPdf(
    buffer: Buffer,
    originalFileName: string
  ): Promise<{ buffer: Buffer; newFileName: string }> {
    const startTime = Date.now();

    try {
      logger.info("Converting document to PDF using libreoffice-convert", {
        fileName: originalFileName,
        fileSize: buffer.length,
      });

      // Определяем расширение выходного файла
      const ext = ".pdf";

      // Конвертируем буфер напрямую в PDF
      // @ts-ignore - libreoffice-convert не имеет типов TypeScript
      const pdfBuffer: Buffer = await libreConvert(buffer, ext, undefined);

      const duration = Date.now() - startTime;

      // Проверяем результат
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error("Conversion resulted in empty buffer");
      }

      // Формируем финальное имя файла
      const baseFileName = originalFileName.substring(
        0,
        originalFileName.lastIndexOf(".")
      );
      const finalPdfFileName = `${baseFileName}.pdf`;

      logger.info("Document converted to PDF successfully", {
        originalFileName,
        finalPdfFileName,
        originalSize: buffer.length,
        pdfSize: pdfBuffer.length,
        durationMs: duration,
      });

      return {
        buffer: pdfBuffer,
        newFileName: finalPdfFileName,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = (error as Error).message;

      logger.error("Failed to convert document to PDF", error, {
        fileName: originalFileName,
        durationMs: duration,
        errorMessage,
      });

      // Определяем тип ошибки для более понятного сообщения
      if (
        errorMessage.includes(
          "Could not find platform independent libraries"
        ) ||
        errorMessage.includes("soffice") ||
        errorMessage.includes("LibreOffice")
      ) {
        throw new Error(
          "LibreOffice not found. Please install LibreOffice on your system. " +
            "Visit: https://www.libreoffice.org/download/"
        );
      }

      if (errorMessage.includes("Document is empty")) {
        throw new Error(
          "Failed to read document. The file may be corrupted or in an unsupported format."
        );
      }

      throw new Error(`Failed to convert document to PDF: ${errorMessage}`);
    }
  }

  private async optimizePhotos(
    arrayBuffer: ArrayBuffer,
    fileName: string
  ): Promise<Buffer> {
    try {
      let extension = this.getExtension(fileName);

      if (extension === "jpg") {
        extension = "jpeg";
      }

      const createdSharp = sharp(arrayBuffer);
      if (extension in createdSharp) {
        // @ts-ignore
        return await createdSharp[extension]({ quality: 60 }).toBuffer();
      }

      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.log("Error optimizing photo:", error);
      return Buffer.from(arrayBuffer);
    }
  }

  private async optimizeAttachment(
    arrayBuffer: ArrayBuffer,
    fileName: string
  ): Promise<ArrayBuffer | Buffer | string | Uint8Array> {
    const typeFile = this.determineFileType(fileName);
    const extension = this.getExtension(fileName);

    logger.info("TypeFile", typeFile);

    // Конвертируем doc/docx/ppt/pptx в PDF
    if (this.needsConversionToPdf(fileName)) {
      logger.info("Document needs conversion to PDF", { fileName, extension });
      const buffer = Buffer.from(arrayBuffer);
      const { buffer: pdfBuffer } = await this.convertToPdf(buffer, fileName);

      // Оптимизируем полученный PDF
      logger.info("Optimizing converted PDF");
      return await compress(pdfBuffer);
    }

    // if (typeFile === "photo") {
    //   return await this.optimizePhotos(arrayBuffer, fileName);
    // }

    if (typeFile === "text") {
      return Buffer.from(arrayBuffer).toString("utf-8");
    }

    if (extension === "pdf") {
      return await compress(Buffer.from(arrayBuffer));
    }

    return Buffer.from(arrayBuffer);
  }

  private determineFileType(filename: string): "photo" | "document" | "text" {
    if (filename.length === 0) {
      throw new Error("Invalid filename: Must be a non-empty string.");
    }

    const photoExtensions: string[] = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "svg",
      "webp",
      "tiff",
      "tif",
    ];

    const documentExtensions: string[] = [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "csv",
      "ppt",
      "pptx",
    ];

    const textExtensions: string[] = [
      "txt",
      "js",
      "html",
      "css",
      "json",
      "xml",
      "md",
      "log",
      "py",
      "java",
      "c",
      "cpp",
      "h",
      "sh",
      "config",
      "conf",
      "ini",
      "yml",
      "yaml",
      "sql",
    ];

    const dotIndex: number = filename.lastIndexOf(".");

    if (dotIndex === -1 || dotIndex === filename.length - 1) {
      throw new Error(`Unknown file type: '${filename}' has no extension.`);
    }

    const extension: string = filename.slice(dotIndex + 1).toLowerCase();

    if (photoExtensions.includes(extension)) {
      return "photo";
    } else if (documentExtensions.includes(extension)) {
      return "document";
    } else if (textExtensions.includes(extension)) {
      return "text";
    } else {
      throw new Error(
        `Unknown or unsupported file type with extension '.${extension}'.`
      );
    }
  }

  async uploadFile(
    arrayBuffer: ArrayBuffer | string | Buffer | Uint8Array,
    name: string
  ): Promise<S3.ManagedUpload.SendData> {
    console.log(arrayBuffer);
    logger.info("File Name", {
      name: this.getFileWithExtension(crypto.randomUUID(), name),
    });
    return (await s3.Upload(
      {
        //@ts-ignore
        buffer: arrayBuffer,
        name: this.getFileWithExtension(crypto.randomUUID(), name),
      },
      "/"
    )) as S3.ManagedUpload.SendData;
  }

  async optimizeAndUploadFile(
    arrayBuffer: ArrayBuffer,
    fileName: string
  ): Promise<{
    url: string;
    optimizedData: ArrayBuffer | Buffer | string | Uint8Array;
    finalFileName: string;
  }> {
    let finalFileName = fileName;

    console.log(
      "this.needsConversionToPdf(fileName)",
      this.needsConversionToPdf(fileName)
    );
    if (this.needsConversionToPdf(fileName)) {
      const baseFileName = fileName.substring(0, fileName.lastIndexOf("."));
      finalFileName = `${baseFileName}.pdf`;
    }

    const optimizedData = await this.optimizeAttachment(arrayBuffer, fileName);
    const uploadResult = await this.uploadFile(optimizedData, finalFileName);
    console.log(uploadResult);
    logger.info("UploadResult", uploadResult);

    return {
      url: uploadResult.Location,
      optimizedData,
      finalFileName,
    };
  }

  /**
   * Удаляет файл из S3 по URL
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Извлекаем имя файла из URL
      const url = new URL(fileUrl);
      const fileName = url.pathname.substring(1); // Убираем первый слеш

      logger.info("Deleting file from S3", { fileName, fileUrl });

      await s3.Remove(fileName);

      logger.info("File deleted from S3 successfully", { fileName });
    } catch (error) {
      logger.error("Failed to delete file from S3", error, { fileUrl });
      throw error;
    }
  }
}
