import Fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { UserRepository } from "./repositories/UserRepository";
import { FileRepository } from "./repositories/FileRepository";
import { PaymentRepository } from "./repositories/PaymentRepository";
import { AuthService } from "./services/AuthService";
import { FilesService } from "./services/FilesService";
import { FileCleanupService } from "./services/FileCleanupService";
import { LLMCostEvaluate } from "./services/LLMCostEvaluate";
import { OpenRouterService } from "./services/OpenRouterService";
import { YooKassaService } from "./services/YooKassaService";
import { logger } from "./services/LoggerService";
import { registerControllers } from "./controllers";

const prisma = new PrismaClient();
const userRepository = new UserRepository(prisma);
const fileRepository = new FileRepository(prisma);
const paymentRepository = new PaymentRepository(prisma);

console.log(process.env);

const authService = new AuthService(
  userRepository,
  process.env.VK_APP_ID!,
  process.env.VK_SECRET_KEY!
);
const filesService = new FilesService();
const fileCleanupService = new FileCleanupService(prisma, filesService);
const llmCostService = new LLMCostEvaluate(100);
const openRouterService = new OpenRouterService(
  process.env.OPENROUTER_API_KEY!
);
const yooKassaService = new YooKassaService(
  process.env.YOOKASSA_SHOP_ID || "1184807",
  process.env.YOOKASSA_SECRET_KEY || "test_XnTIPN_kQjZoX3ZYAbJ4DL6Z3Q-vo_4uXqWtf81-dm4",
  paymentRepository,
  userRepository
);

const fastify = Fastify({
  logger: true,
  disableRequestLogging: true,
  bodyLimit: 80 * 1024 * 1024, // 80 МБ лимит для тела запроса
  trustProxy: true, // Доверяем заголовкам от reverse proxy (Traefik)
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
  keyGenerator: (request: any) => {
    const ip = request.ip;
    const userId = request.userId || "anonymous";
    return `rate_limit:${ip}:${userId}`;
  },
  errorResponseBuilder: (request: any, context: any) => {
    return {
      error: "Too Many Requests",
      message: `Rate limit exceeded. Maximum ${context.max} requests per ${
        context.timeWindow / 1000
      } seconds.`,
      retryAfter: Math.ceil(context.after / 1000),
    };
  },
});

fastify.register(require("@fastify/multipart"), {
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

fastify.addHook("preHandler", async (request: any, reply) => {
  request.requestId = require("uuid").v4();
  request.startTime = Date.now();
  logger.apiRequest(request.method, request.url, request.userId, {
    requestId: request.requestId,
    userAgent: request.headers["user-agent"],
    ip: request.ip,
  });
});

fastify.addHook("onResponse", async (request: any, reply) => {
  const duration = Date.now() - (request.startTime || 0);
  logger.apiResponse(
    request.method,
    request.url,
    reply.statusCode,
    duration,
    request.userId,
    {
      requestId: request.requestId,
    }
  );
});

fastify.setErrorHandler(async (error, request: any, reply) => {
  const duration = Date.now() - (request.startTime || 0);
  logger.error(`Request failed: ${request.method} ${request.url}`, error, {
    requestId: request.requestId,
    userId: request.userId,
    duration,
    statusCode: reply.statusCode,
  });
  throw error;
});

registerControllers(fastify, {
  authService,
  userRepository,
  fileRepository,
  filesService,
  llmCostService,
  openRouterService,
  yooKassaService,
});

const start = async () => {
  try {
    logger.info("Starting GPTutor Backend v2...");

    await llmCostService.initialize();

    fileCleanupService.start();

    await fastify.listen({
      port: Number(process.env.PORT) || 3001,
      host: "0.0.0.0",
    });

    logger.info("🚀 Server is running", {
      port: Number(process.env.PORT) || 3001,
      host: "0.0.0.0",
      environment: process.env.NODE_ENV || "development",
    });
  } catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  logger.info("Received SIGINT, shutting down gracefully...");
  try {
    fileCleanupService.stop();
    await fastify.close();
    await prisma.$disconnect();
    logger.info("Server shut down successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown", error);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM, shutting down gracefully...");
  try {
    fileCleanupService.stop();
    await fastify.close();
    await prisma.$disconnect();
    logger.info("Server shut down successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown", error);
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", reason, { promise });
  process.exit(1);
});

start();
