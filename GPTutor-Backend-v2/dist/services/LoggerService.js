"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LoggerService = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
class LoggerService {
    // Safe JSON stringify that handles circular references
    static safeStringify(obj, space) {
        const seen = new WeakSet();
        return JSON.stringify(obj, (key, val) => {
            if (val != null && typeof val === "object") {
                if (seen.has(val)) {
                    return "[Circular]";
                }
                seen.add(val);
            }
            return val;
        }, space);
    }
    constructor() {
        this.logger = this.createLogger();
    }
    static getInstance() {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }
    createLogger() {
        const logDir = path_1.default.join(process.cwd(), "logs");
        // Custom format for better readability
        const customFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf(({ timestamp, level, message, service, userId, requestId, ...meta }) => {
            let logMessage = `[${timestamp}] ${level.toUpperCase()}`;
            if (service)
                logMessage += ` [${service}]`;
            if (requestId)
                logMessage += ` [ReqID: ${requestId}]`;
            if (userId)
                logMessage += ` [User: ${userId}]`;
            logMessage += `: ${message}`;
            const metaStr = Object.keys(meta).length
                ? ` ${LoggerService.safeStringify(meta)}`
                : "";
            return logMessage + metaStr;
        }));
        const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), customFormat);
        return winston_1.default.createLogger({
            level: process.env.LOG_LEVEL || "info",
            format: customFormat,
            defaultMeta: { service: "gptutor-backend" },
            transports: [
                new winston_1.default.transports.Console({
                    format: consoleFormat,
                }),
                new winston_daily_rotate_file_1.default({
                    filename: path_1.default.join(logDir, "error-%DATE%.log"),
                    datePattern: "YYYY-MM-DD",
                    level: "error",
                    maxSize: "20m",
                    maxFiles: "14d",
                    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
                }),
                new winston_daily_rotate_file_1.default({
                    filename: path_1.default.join(logDir, "combined-%DATE%.log"),
                    datePattern: "YYYY-MM-DD",
                    maxSize: "20m",
                    maxFiles: "30d",
                    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
                }),
                // API requests log file
                new winston_daily_rotate_file_1.default({
                    filename: path_1.default.join(logDir, "api-%DATE%.log"),
                    datePattern: "YYYY-MM-DD",
                    maxSize: "20m",
                    maxFiles: "30d",
                    level: "info",
                    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
                }),
            ],
        });
    }
    // Basic logging methods
    debug(message, meta) {
        this.logger.debug(message, meta);
    }
    info(message, meta) {
        this.logger.info(message, meta);
    }
    warn(message, meta) {
        this.logger.warn(message, meta);
    }
    error(message, error, meta) {
        if (error instanceof Error) {
            this.logger.error(message, {
                error: error.message,
                stack: error.stack,
                ...meta,
            });
        }
        else {
            this.logger.error(message, { error, ...meta });
        }
    }
    // Specialized logging methods
    apiRequest(method, url, userId, meta) {
        this.logger.info(`${method} ${url}`, {
            type: "api",
            service: "api",
            method,
            url,
            userId,
            ...meta,
        });
    }
    apiResponse(method, url, statusCode, duration, userId, meta) {
        this.logger.info(`${method} ${url} - ${statusCode} (${duration}ms)`, {
            type: "api",
            service: "api",
            method,
            url,
            statusCode,
            duration,
            userId,
            ...meta,
        });
    }
    llmRequest(model, userId, tokens, cost, meta) {
        this.logger.info(`LLM Request: ${model}`, {
            type: "llm",
            service: "llm",
            model,
            userId,
            tokens,
            cost,
            ...meta,
        });
    }
    llmResponse(model, userId, tokens, cost, duration, meta) {
        this.logger.info(`LLM Response: ${model} - ${tokens} tokens, ${cost} RUB (${duration}ms)`, {
            type: "llm",
            service: "llm",
            model,
            userId,
            tokens,
            cost,
            duration,
            ...meta,
        });
    }
    auth(action, userId, success = true, meta) {
        const level = success ? "info" : "warn";
        this.logger[level](`Auth ${action}: ${success ? "SUCCESS" : "FAILED"}`, {
            type: "auth",
            service: "auth",
            action,
            userId,
            success,
            ...meta,
        });
    }
    balance(action, userId, amount, newBalance, meta) {
        this.logger.info(`Balance ${action}: ${amount} RUB`, {
            type: "balance",
            service: "balance",
            action,
            userId,
            amount,
            newBalance,
            ...meta,
        });
    }
    // Create child logger with additional context
    child(defaultMeta) {
        return this.logger.child(defaultMeta);
    }
    // Get the underlying winston logger
    getWinstonLogger() {
        return this.logger;
    }
}
exports.LoggerService = LoggerService;
// Export singleton instance
exports.logger = LoggerService.getInstance();
