"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterService = void 0;
const openai_1 = __importDefault(require("openai"));
class OpenRouterService {
    constructor(apiKey) {
        this.client = new openai_1.default({
            apiKey: apiKey,
            baseURL: "https://openrouter.ai/api/v1",
            defaultHeaders: {
                "HTTP-Referer": "http://localhost:3001",
                "X-Title": "GPTutor API v2",
            },
        });
    }
    async createCompletion(params) {
        try {
            const completion = await this.client.chat.completions.create({
                ...params,
                stream: false,
                usage: { include: true },
            });
            return completion;
        }
        catch (error) {
            console.error("OpenRouter API request failed:", error);
            throw error;
        }
    }
    async createCompletionStream(params) {
        try {
            //@ts-ignore
            return this.client.chat.completions.create({
                ...params,
                stream: true,
                usage: {
                    include: true,
                },
            });
        }
        catch (error) {
            console.error("OpenRouter API stream request failed:", error);
            throw error;
        }
    }
    async getModels() {
        try {
            const models = await this.client.models.list();
            return models;
        }
        catch (error) {
            console.error("Failed to get Models from OpenRouter:", error);
            throw error;
        }
    }
}
exports.OpenRouterService = OpenRouterService;
