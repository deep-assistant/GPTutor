import winston from "winston";
export declare class LoggerService {
    private logger;
    private static instance;
    private static safeStringify;
    private constructor();
    static getInstance(): LoggerService;
    private createLogger;
    debug(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, error?: Error | any, meta?: any): void;
    apiRequest(method: string, url: string, userId?: string, meta?: any): void;
    apiResponse(method: string, url: string, statusCode: number, duration: number, userId?: string, meta?: any): void;
    llmRequest(model: string, userId: string, tokens?: number, cost?: number, meta?: any): void;
    llmResponse(model: string, userId: string, tokens: number, cost: number, duration: number, meta?: any): void;
    auth(action: string, userId?: string, success?: boolean, meta?: any): void;
    balance(action: string, userId: string, amount: number, newBalance: number, meta?: any): void;
    child(defaultMeta: any): winston.Logger;
    getWinstonLogger(): winston.Logger;
}
export declare const logger: LoggerService;
