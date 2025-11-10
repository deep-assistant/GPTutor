import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

export class LoggerService {
  private logger: winston.Logger;
  private static instance: LoggerService;

  // Safe JSON stringify that handles circular references
  private static safeStringify(obj: any, space?: number): string {
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

  private constructor() {
    this.logger = this.createLogger();
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private createLogger(): winston.Logger {
    const logDir = path.join(process.cwd(), "logs");

    // Custom format for better readability
    const customFormat = winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      winston.format.errors({ stack: true }),
      winston.format.printf(
        ({
          timestamp,
          level,
          message,
          service,
          userId,
          requestId,
          ...meta
        }) => {
          let logMessage = `[${timestamp}] ${level.toUpperCase()}`;

          if (service) logMessage += ` [${service}]`;
          if (requestId) logMessage += ` [ReqID: ${requestId}]`;
          if (userId) logMessage += ` [User: ${userId}]`;

          logMessage += `: ${message}`;

          const metaStr = Object.keys(meta).length
            ? ` ${LoggerService.safeStringify(meta)}`
            : "";
          return logMessage + metaStr;
        }
      )
    );

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      customFormat
    );

    return winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: customFormat,
      defaultMeta: { service: "gptutor-backend" },
      transports: [
        new winston.transports.Console({
          format: consoleFormat,
        }),

        new DailyRotateFile({
          filename: path.join(logDir, "error-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          level: "error",
          maxSize: "20m",
          maxFiles: "14d",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),

        new DailyRotateFile({
          filename: path.join(logDir, "combined-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          maxSize: "20m",
          maxFiles: "30d",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),

        // API requests log file
        new DailyRotateFile({
          filename: path.join(logDir, "api-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          maxSize: "20m",
          maxFiles: "30d",
          level: "info",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
      ],
    });
  }

  // Basic logging methods
  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public error(message: string, error?: Error | any, meta?: any): void {
    if (error instanceof Error) {
      this.logger.error(message, {
        error: error.message,
        stack: error.stack,
        ...meta,
      });
    } else {
      this.logger.error(message, { error, ...meta });
    }
  }

  // Specialized logging methods
  public apiRequest(
    method: string,
    url: string,
    userId?: string,
    meta?: any
  ): void {
    this.logger.info(`${method} ${url}`, {
      type: "api",
      service: "api",
      method,
      url,
      userId,
      ...meta,
    });
  }

  public apiResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: string,
    meta?: any
  ): void {
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

  public llmRequest(
    model: string,
    userId: string,
    tokens?: number,
    cost?: number,
    meta?: any
  ): void {
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

  public llmResponse(
    model: string,
    userId: string,
    tokens: number,
    cost: number,
    duration: number,
    meta?: any
  ): void {
    this.logger.info(
      `LLM Response: ${model} - ${tokens} tokens, ${cost} RUB (${duration}ms)`,
      {
        type: "llm",
        service: "llm",
        model,
        userId,
        tokens,
        cost,
        duration,
        ...meta,
      }
    );
  }

  public auth(
    action: string,
    userId?: string,
    success: boolean = true,
    meta?: any
  ): void {
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

  public balance(
    action: string,
    userId: string,
    amount: number,
    newBalance: number,
    meta?: any
  ): void {
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
  public child(defaultMeta: any): winston.Logger {
    return this.logger.child(defaultMeta);
  }

  // Get the underlying winston logger
  public getWinstonLogger(): winston.Logger {
    return this.logger;
  }
}

// Export singleton instance
export const logger = LoggerService.getInstance();
