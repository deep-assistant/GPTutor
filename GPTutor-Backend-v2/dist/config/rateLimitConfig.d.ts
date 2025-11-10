import { RateLimitOptions } from "../middleware/rateLimitMiddleware";
export declare const RATE_LIMIT_CONFIG: RateLimitOptions;
export declare function getRateLimitConfigForEnv(): RateLimitOptions;
export declare function getRateLimitForRoute(route: string): import("../middleware/rateLimitMiddleware").RateLimitConfig;
