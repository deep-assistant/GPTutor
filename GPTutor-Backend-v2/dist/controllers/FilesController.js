"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const BaseController_1 = require("./BaseController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
class FilesController extends BaseController_1.BaseController {
    constructor(fastify, filesService, fileRepository, authService) {
        super(fastify);
        this.filesService = filesService;
        this.fileRepository = fileRepository;
        this.authService = authService;
    }
    registerRoutes() {
        const vkAuthMiddleware = (0, authMiddleware_1.createVkAuthMiddleware)(this.authService);
        const uploadRateLimit = (0, rateLimitMiddleware_1.createRateLimitMiddleware)((0, rateLimitMiddleware_1.getRateLimitConfig)("/upload"));
        this.fastify.post("/upload", {
            preHandler: [uploadRateLimit, vkAuthMiddleware],
            config: {
                bodyLimit: 50 * 1024 * 1024,
            },
        }, this.uploadFile.bind(this));
    }
    async uploadFile(request, reply) {
        try {
            this.logInfo("File upload requested", {
                userId: request.dbUser.id,
                vkId: request.dbUser.vkId,
            });
            const data = await request.file();
            if (!data) {
                return this.sendError(reply, "No file provided", 400, request);
            }
            const maxSize = 50 * 1024 * 1024;
            if (data.file.bytesRead > maxSize) {
                return this.sendError(reply, "File too large. Maximum size is 50MB", 413, request);
            }
            const fileBuffer = await data.toBuffer();
            const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
            this.logInfo("Processing file", {
                fileName: data.filename,
                fileSize: data.file.bytesRead,
                mimeType: data.mimetype,
            });
            const existingFile = await this.fileRepository.findByNameAndSizeOrOriginal(data.filename, data.file.bytesRead);
            if (existingFile) {
                this.logInfo("File already exists, returning cached file", {
                    fileId: existingFile.id,
                    fileName: existingFile.name,
                    url: existingFile.url,
                    wasConverted: existingFile.converted,
                    originalName: existingFile.originalName,
                });
                return this.sendSuccess(reply, {
                    message: existingFile.converted
                        ? "File already converted and cached!"
                        : "File already exists!",
                    file: {
                        id: existingFile.id,
                        name: existingFile.name,
                        type: existingFile.type,
                        url: existingFile.url,
                        size: existingFile.size,
                        createdAt: existingFile.createdAt,
                    },
                    converted: existingFile.converted,
                    fromCache: true,
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.filesService.optimizeAndUploadFile(arrayBuffer, data.filename);
            let finalMimeType = data.mimetype;
            let finalFileName = data.filename;
            let wasConverted = false;
            if (result.finalFileName !== data.filename) {
                wasConverted = true;
                finalMimeType = "application/pdf";
                finalFileName = result.finalFileName;
                this.logInfo("File was converted to PDF", {
                    originalName: data.filename,
                    originalType: data.mimetype,
                    originalSize: data.file.bytesRead,
                    finalName: finalFileName,
                    finalType: finalMimeType,
                });
            }
            // Сохраняем файл с информацией об оригинале (если был конвертирован)
            const savedFile = await this.fileRepository.create({
                userId: request.dbUser.id,
                type: finalMimeType,
                name: finalFileName,
                url: result.url,
                size: data.file.bytesRead, // Сохраняем оригинальный размер для правильного кеширования
                originalName: wasConverted ? data.filename : undefined,
                originalSize: wasConverted ? data.file.bytesRead : undefined,
                converted: wasConverted,
            });
            this.logInfo("File uploaded successfully", {
                fileId: savedFile.id,
                fileName: savedFile.name,
                url: savedFile.url,
                userId: request.dbUser.id,
                wasConverted: wasConverted,
                originalName: savedFile.originalName,
                originalSize: savedFile.originalSize,
            });
            return this.sendSuccess(reply, {
                message: wasConverted
                    ? "File converted to PDF and uploaded successfully!"
                    : "File uploaded successfully!",
                file: {
                    id: savedFile.id,
                    name: savedFile.name,
                    type: savedFile.type,
                    url: savedFile.url,
                    size: savedFile.size,
                    createdAt: savedFile.createdAt,
                },
                converted: wasConverted,
                fromCache: false,
                ...(wasConverted && {
                    originalFile: {
                        name: savedFile.originalName,
                        size: savedFile.originalSize,
                    },
                }),
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            this.logError("File upload failed", error);
            if (error instanceof Error) {
                const errorMessage = error.message;
                if (errorMessage.includes("Unknown or unsupported file type")) {
                    return this.sendError(reply, "Unsupported file type", 400, request);
                }
                if (errorMessage.includes("Invalid filename")) {
                    return this.sendError(reply, "Invalid filename", 400, request);
                }
                if (errorMessage.includes("LibreOffice not found")) {
                    return this.sendError(reply, "Document conversion requires LibreOffice. Please contact administrator.", 503, request);
                }
                if (errorMessage.includes("Failed to read document") ||
                    errorMessage.includes("corrupted")) {
                    return this.sendError(reply, "Failed to convert document. The file may be corrupted or password-protected.", 400, request);
                }
                if (errorMessage.includes("Failed to convert document to PDF")) {
                    return this.sendError(reply, "Failed to convert document to PDF. Please try again or use a different file.", 400, request);
                }
            }
            return this.sendError(reply, "Failed to upload file", 500, request);
        }
    }
}
exports.FilesController = FilesController;
