"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const sharp_1 = __importDefault(require("sharp"));
const compress_pdf_1 = require("compress-pdf");
//@ts-ignore
const easy_yandex_s3_1 = __importDefault(require("easy-yandex-s3"));
const crypto_1 = __importDefault(require("crypto"));
const LoggerService_1 = require("./LoggerService");
//@ts-ignore
const libreoffice_convert_1 = __importDefault(require("libreoffice-convert"));
const util_1 = require("util");
// Используем extend для callback, чтобы избежать deprecation warning
const libreConvert = (0, util_1.promisify)(libreoffice_convert_1.default.convert.bind(libreoffice_convert_1.default));
const s3 = new easy_yandex_s3_1.default({
    auth: {
        accessKeyId: process.env.YANDEX_ACCESS_KEY_ID,
        secretAccessKey: process.env.YANDEX_SECRET_ACCESS_KEY,
    },
    httpOptions: {
        timeout: 60000,
    },
    Bucket: process.env.YANDEX_BUCKET,
    debug: process.env.NODE_ENV === "development",
});
class FilesService {
    getExtension(fileName) {
        const splitFileName = fileName.split(".");
        return splitFileName[splitFileName.length - 1].toLowerCase();
    }
    getFileWithExtension(name, originalFileName) {
        return `${name}.${this.getExtension(originalFileName)}`;
    }
    /**
     * Проверяет, нужна ли конвертация файла в PDF
     */
    needsConversionToPdf(fileName) {
        const extension = this.getExtension(fileName);
        const convertibleExtensions = ["doc", "docx", "ppt", "pptx"];
        return convertibleExtensions.includes(extension);
    }
    /**
     * Конвертирует документ в PDF с помощью LibreOffice (через libreoffice-convert)
     * Работает напрямую с буферами без создания временных файлов
     */
    async convertToPdf(buffer, originalFileName) {
        const startTime = Date.now();
        try {
            LoggerService_1.logger.info("Converting document to PDF using libreoffice-convert", {
                fileName: originalFileName,
                fileSize: buffer.length,
            });
            // Определяем расширение выходного файла
            const ext = ".pdf";
            // Конвертируем буфер напрямую в PDF
            // @ts-ignore - libreoffice-convert не имеет типов TypeScript
            const pdfBuffer = await libreConvert(buffer, ext, undefined);
            const duration = Date.now() - startTime;
            // Проверяем результат
            if (!pdfBuffer || pdfBuffer.length === 0) {
                throw new Error("Conversion resulted in empty buffer");
            }
            // Формируем финальное имя файла
            const baseFileName = originalFileName.substring(0, originalFileName.lastIndexOf("."));
            const finalPdfFileName = `${baseFileName}.pdf`;
            LoggerService_1.logger.info("Document converted to PDF successfully", {
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const errorMessage = error.message;
            LoggerService_1.logger.error("Failed to convert document to PDF", error, {
                fileName: originalFileName,
                durationMs: duration,
                errorMessage,
            });
            // Определяем тип ошибки для более понятного сообщения
            if (errorMessage.includes("Could not find platform independent libraries") ||
                errorMessage.includes("soffice") ||
                errorMessage.includes("LibreOffice")) {
                throw new Error("LibreOffice not found. Please install LibreOffice on your system. " +
                    "Visit: https://www.libreoffice.org/download/");
            }
            if (errorMessage.includes("Document is empty")) {
                throw new Error("Failed to read document. The file may be corrupted or in an unsupported format.");
            }
            throw new Error(`Failed to convert document to PDF: ${errorMessage}`);
        }
    }
    async optimizePhotos(arrayBuffer, fileName) {
        try {
            let extension = this.getExtension(fileName);
            if (extension === "jpg") {
                extension = "jpeg";
            }
            const createdSharp = (0, sharp_1.default)(arrayBuffer);
            if (extension in createdSharp) {
                // @ts-ignore
                return await createdSharp[extension]({ quality: 60 }).toBuffer();
            }
            return Buffer.from(arrayBuffer);
        }
        catch (error) {
            console.log("Error optimizing photo:", error);
            return Buffer.from(arrayBuffer);
        }
    }
    async optimizeAttachment(arrayBuffer, fileName) {
        const typeFile = this.determineFileType(fileName);
        const extension = this.getExtension(fileName);
        LoggerService_1.logger.info("TypeFile", typeFile);
        // Конвертируем doc/docx/ppt/pptx в PDF
        if (this.needsConversionToPdf(fileName)) {
            LoggerService_1.logger.info("Document needs conversion to PDF", { fileName, extension });
            const buffer = Buffer.from(arrayBuffer);
            const { buffer: pdfBuffer } = await this.convertToPdf(buffer, fileName);
            // Оптимизируем полученный PDF
            LoggerService_1.logger.info("Optimizing converted PDF");
            return await (0, compress_pdf_1.compress)(pdfBuffer);
        }
        if (typeFile === "photo") {
            return await this.optimizePhotos(arrayBuffer, fileName);
        }
        if (typeFile === "text") {
            return Buffer.from(arrayBuffer).toString("utf-8");
        }
        if (extension === "pdf") {
            return await (0, compress_pdf_1.compress)(Buffer.from(arrayBuffer));
        }
        return Buffer.from(arrayBuffer);
    }
    determineFileType(filename) {
        if (filename.length === 0) {
            throw new Error("Invalid filename: Must be a non-empty string.");
        }
        const photoExtensions = [
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
        const documentExtensions = [
            "pdf",
            "doc",
            "docx",
            "xls",
            "xlsx",
            "csv",
            "ppt",
            "pptx",
        ];
        const textExtensions = [
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
        const dotIndex = filename.lastIndexOf(".");
        if (dotIndex === -1 || dotIndex === filename.length - 1) {
            throw new Error(`Unknown file type: '${filename}' has no extension.`);
        }
        const extension = filename.slice(dotIndex + 1).toLowerCase();
        if (photoExtensions.includes(extension)) {
            return "photo";
        }
        else if (documentExtensions.includes(extension)) {
            return "document";
        }
        else if (textExtensions.includes(extension)) {
            return "text";
        }
        else {
            throw new Error(`Unknown or unsupported file type with extension '.${extension}'.`);
        }
    }
    async uploadFile(arrayBuffer, name) {
        console.log(arrayBuffer);
        LoggerService_1.logger.info("File Name", {
            name: this.getFileWithExtension(crypto_1.default.randomUUID(), name),
        });
        return (await s3.Upload({
            //@ts-ignore
            buffer: arrayBuffer,
            name: this.getFileWithExtension(crypto_1.default.randomUUID(), name),
        }, "/"));
    }
    async optimizeAndUploadFile(arrayBuffer, fileName) {
        let finalFileName = fileName;
        console.log("this.needsConversionToPdf(fileName)", this.needsConversionToPdf(fileName));
        if (this.needsConversionToPdf(fileName)) {
            const baseFileName = fileName.substring(0, fileName.lastIndexOf("."));
            finalFileName = `${baseFileName}.pdf`;
        }
        const optimizedData = await this.optimizeAttachment(arrayBuffer, fileName);
        const uploadResult = await this.uploadFile(optimizedData, finalFileName);
        console.log(uploadResult);
        LoggerService_1.logger.info("UploadResult", uploadResult);
        return {
            url: uploadResult.Location,
            optimizedData,
            finalFileName,
        };
    }
    /**
     * Удаляет файл из S3 по URL
     */
    async deleteFile(fileUrl) {
        try {
            // Извлекаем имя файла из URL
            const url = new URL(fileUrl);
            const fileName = url.pathname.substring(1); // Убираем первый слеш
            LoggerService_1.logger.info("Deleting file from S3", { fileName, fileUrl });
            await s3.Remove(fileName);
            LoggerService_1.logger.info("File deleted from S3 successfully", { fileName });
        }
        catch (error) {
            LoggerService_1.logger.error("Failed to delete file from S3", error, { fileUrl });
            throw error;
        }
    }
}
exports.FilesService = FilesService;
