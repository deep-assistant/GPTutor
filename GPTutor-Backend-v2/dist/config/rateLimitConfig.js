"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMIT_CONFIG = void 0;
exports.getRateLimitConfigForEnv = getRateLimitConfigForEnv;
exports.getRateLimitForRoute = getRateLimitForRoute;
exports.RATE_LIMIT_CONFIG = {
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
        max: 500,
        timeWindow: 60 * 1000,
    },
    "/v1/models": {
        max: 50,
        timeWindow: 60 * 1000,
    },
};
function getRateLimitConfigForEnv() {
    return { ...exports.RATE_LIMIT_CONFIG };
}
function getRateLimitForRoute(route) {
    const config = getRateLimitConfigForEnv();
    return (config[route] || {
        max: 30,
        timeWindow: 60 * 1000,
    });
}
