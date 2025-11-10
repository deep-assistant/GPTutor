"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
const LoggerService_1 = require("../services/LoggerService");
class BaseController {
    constructor(fastify) {
        this.fastify = fastify;
    }
    sendSuccess(reply, data, statusCode = 200) {
        return reply.code(statusCode).send(data);
    }
    sendError(reply, message, statusCode = 500, request) {
        if (request) {
            LoggerService_1.logger.warn(`Response error: ${message}`, {
                requestId: request.requestId,
                userId: request.userId,
                statusCode,
                url: request.url,
                method: request.method
            });
        }
        return reply.code(statusCode).send({ error: message });
    }
    sendValidationError(reply, message, request) {
        return this.sendError(reply, message, 400, request);
    }
    sendUnauthorized(reply, message = 'Unauthorized', request) {
        return this.sendError(reply, message, 401, request);
    }
    sendNotFound(reply, message = 'Not found', request) {
        return this.sendError(reply, message, 404, request);
    }
    sendInsufficientBalance(reply, request) {
        return this.sendError(reply, 'Insufficient balance', 402, request);
    }
    logInfo(message, meta, request) {
        LoggerService_1.logger.info(message, {
            ...meta,
            requestId: request?.requestId,
            userId: request?.userId
        });
    }
    logError(message, error, meta, request) {
        LoggerService_1.logger.error(message, error, {
            ...meta,
            requestId: request?.requestId,
            userId: request?.userId
        });
    }
    logWarn(message, meta, request) {
        LoggerService_1.logger.warn(message, {
            ...meta,
            requestId: request?.requestId,
            userId: request?.userId
        });
    }
    logDebug(message, meta, request) {
        LoggerService_1.logger.debug(message, {
            ...meta,
            requestId: request?.requestId,
            userId: request?.userId
        });
    }
}
exports.BaseController = BaseController;
