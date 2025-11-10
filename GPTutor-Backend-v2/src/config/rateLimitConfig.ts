import { RateLimitOptions } from "../middleware/rateLimitMiddleware";

export const RATE_LIMIT_CONFIG: RateLimitOptions = {
  "/health": {
    max: 100,
    timeWindow: 60 * 1000,
  },

  "/user": {
    max: 30,
    timeWindow: 60 * 1000,
  },

  "/update-token": {
    max: 5,
    timeWindow: 60 * 1000,
  },

  "/upload": {
    max: 10,
    timeWindow: 60 * 1000,
  },

  "/v1/chat/completions": {
    max: 5,
    timeWindow: 60 * 1000,
  },

  "/v1/models": {
    max: 50,
    timeWindow: 60 * 1000,
  },

  "/payments/create": {
    max: 10,
    timeWindow: 60 * 1000,
  },

  "/payments": {
    max: 30,
    timeWindow: 60 * 1000,
  },
};

export function getRateLimitConfigForEnv(): RateLimitOptions {
  return { ...RATE_LIMIT_CONFIG };
}

export function getRateLimitForRoute(route: string) {
  const config = getRateLimitConfigForEnv();
  return (
    config[route] || {
      max: 30,
      timeWindow: 60 * 1000,
    }
  );
}
