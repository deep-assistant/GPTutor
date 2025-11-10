import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../services/LoggerService';
import { RequestWithLogging } from '../middleware/loggingMiddleware';

export abstract class BaseController {
  constructor(protected fastify: FastifyInstance) {}

  abstract registerRoutes(): void;

  protected sendSuccess(reply: FastifyReply, data: any, statusCode = 200) {
    return reply.code(statusCode).send(data);
  }

  protected sendError(reply: FastifyReply, message: string, statusCode = 500, request?: RequestWithLogging) {
    if (request) {
      logger.warn(`Response error: ${message}`, {
        requestId: request.requestId,
        userId: request.userId,
        statusCode,
        url: request.url,
        method: request.method
      });
    }
    return reply.code(statusCode).send({ error: message });
  }

  protected sendValidationError(reply: FastifyReply, message: string, request?: RequestWithLogging) {
    return this.sendError(reply, message, 400, request);
  }

  protected sendUnauthorized(reply: FastifyReply, message = 'Unauthorized', request?: RequestWithLogging) {
    return this.sendError(reply, message, 401, request);
  }

  protected sendNotFound(reply: FastifyReply, message = 'Not found', request?: RequestWithLogging) {
    return this.sendError(reply, message, 404, request);
  }

  protected sendInsufficientBalance(reply: FastifyReply, request?: RequestWithLogging) {
    return this.sendError(reply, 'Insufficient balance', 402, request);
  }

  protected logInfo(message: string, meta?: any, request?: RequestWithLogging) {
    logger.info(message, {
      ...meta,
      requestId: request?.requestId,
      userId: request?.userId
    });
  }

  protected logError(message: string, error?: Error | any, meta?: any, request?: RequestWithLogging) {
    logger.error(message, error, {
      ...meta,
      requestId: request?.requestId,
      userId: request?.userId
    });
  }

  protected logWarn(message: string, meta?: any, request?: RequestWithLogging) {
    logger.warn(message, {
      ...meta,
      requestId: request?.requestId,
      userId: request?.userId
    });
  }

  protected logDebug(message: string, meta?: any, request?: RequestWithLogging) {
    logger.debug(message, {
      ...meta,
      requestId: request?.requestId,
      userId: request?.userId
    });
  }
}
