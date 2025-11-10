"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const client_1 = require("@prisma/client");
const UserRepository_1 = require("./repositories/UserRepository");
const FileRepository_1 = require("./repositories/FileRepository");
const AuthService_1 = require("./services/AuthService");
const FilesService_1 = require("./services/FilesService");
const FileCleanupService_1 = require("./services/FileCleanupService");
const LLMCostEvaluate_1 = require("./services/LLMCostEvaluate");
const OpenRouterService_1 = require("./services/OpenRouterService");
const LoggerService_1 = require("./services/LoggerService");
const controllers_1 = require("./controllers");
const prisma = new client_1.PrismaClient();
const userRepository = new UserRepository_1.UserRepository(prisma);
const fileRepository = new FileRepository_1.FileRepository(prisma);
console.log(process.env);
const authService = new AuthService_1.AuthService(userRepository, process.env.VK_APP_ID, process.env.VK_SECRET_KEY);
const filesService = new FilesService_1.FilesService();
const fileCleanupService = new FileCleanupService_1.FileCleanupService(prisma, filesService);
const llmCostService = new LLMCostEvaluate_1.LLMCostEvaluate(100);
const openRouterService = new OpenRouterService_1.OpenRouterService(process.env.OPENROUTER_API_KEY);
const fastify = (0, fastify_1.default)({
    logger: true,
    disableRequestLogging: true,
});
fastify.register(require("@fastify/cors"), {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "Cache-Control",
        "Pragma",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
});
fastify.register(require("@fastify/helmet"));
fastify.register(require("@fastify/rate-limit"), {
    max: 100,
    timeWindow: 60 * 1000,
    keyGenerator: (request) => {
        const ip = request.ip;
        const userId = request.userId || "anonymous";
        return `rate_limit:${ip}:${userId}`;
    },
    errorResponseBuilder: (request, context) => {
        return {
            error: "Too Many Requests",
            message: `Rate limit exceeded. Maximum ${context.max} requests per ${context.timeWindow / 1000} seconds.`,
            retryAfter: Math.ceil(context.after / 1000),
        };
    },
});
fastify.register(require("@fastify/multipart"), {
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
});
fastify.addHook("preHandler", async (request, reply) => {
    request.requestId = require("uuid").v4();
    request.startTime = Date.now();
    LoggerService_1.logger.apiRequest(request.method, request.url, request.userId, {
        requestId: request.requestId,
        userAgent: request.headers["user-agent"],
        ip: request.ip,
    });
});
fastify.addHook("onResponse", async (request, reply) => {
    const duration = Date.now() - (request.startTime || 0);
    LoggerService_1.logger.apiResponse(request.method, request.url, reply.statusCode, duration, request.userId, {
        requestId: request.requestId,
    });
});
fastify.setErrorHandler(async (error, request, reply) => {
    const duration = Date.now() - (request.startTime || 0);
    LoggerService_1.logger.error(`Request failed: ${request.method} ${request.url}`, error, {
        requestId: request.requestId,
        userId: request.userId,
        duration,
        statusCode: reply.statusCode,
    });
    throw error;
});
(0, controllers_1.registerControllers)(fastify, {
    authService,
    userRepository,
    fileRepository,
    filesService,
    llmCostService,
    openRouterService,
});
const start = async () => {
    try {
        LoggerService_1.logger.info("Starting GPTutor Backend v2...");
        await llmCostService.initialize();
        fileCleanupService.start();
        await fastify.listen({
            port: Number(process.env.PORT) || 3001,
            host: "0.0.0.0",
        });
        LoggerService_1.logger.info("🚀 Server is running", {
            port: Number(process.env.PORT) || 3001,
            host: "0.0.0.0",
            environment: process.env.NODE_ENV || "development",
        });
    }
    catch (err) {
        LoggerService_1.logger.error("Failed to start server", err);
        process.exit(1);
    }
};
process.on("SIGINT", async () => {
    LoggerService_1.logger.info("Received SIGINT, shutting down gracefully...");
    try {
        fileCleanupService.stop();
        await fastify.close();
        await prisma.$disconnect();
        LoggerService_1.logger.info("Server shut down successfully");
        process.exit(0);
    }
    catch (error) {
        LoggerService_1.logger.error("Error during shutdown", error);
        process.exit(1);
    }
});
process.on("SIGTERM", async () => {
    LoggerService_1.logger.info("Received SIGTERM, shutting down gracefully...");
    try {
        fileCleanupService.stop();
        await fastify.close();
        await prisma.$disconnect();
        LoggerService_1.logger.info("Server shut down successfully");
        process.exit(0);
    }
    catch (error) {
        LoggerService_1.logger.error("Error during shutdown", error);
        process.exit(1);
    }
});
process.on("uncaughtException", (error) => {
    LoggerService_1.logger.error("Uncaught Exception", error);
    process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    LoggerService_1.logger.error("Unhandled Rejection", reason, { promise });
    process.exit(1);
});
start();
