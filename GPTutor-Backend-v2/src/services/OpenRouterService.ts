import OpenAI from "openai";
import type {
  ChatCompletion,
  ChatCompletionCreateParams,
} from "openai/resources/chat/completions";

export class OpenRouterService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3001",
        "X-Title": "GPTutor API v2",
      },
    });
  }

  async createCompletion(
    params: ChatCompletionCreateParams
  ): Promise<ChatCompletion> {
    try {
      const completion = await this.client.chat.completions.create({
        ...params,
        stream: false,
        usage: { include: true },
      } as any);
      return completion as ChatCompletion;
    } catch (error) {
      console.error("OpenRouter API request failed:", error);
      throw error;
    }
  }

  async createCompletionStream(params: ChatCompletionCreateParams) {
    try {
      //@ts-ignore
      return this.client.chat.completions.create({
        ...params,
        stream: true,
        usage: {
          include: true,
        },
      });
    } catch (error) {
      console.error("OpenRouter API stream request failed:", error);
      throw error;
    }
  }

  async getModels() {
    try {
      const models = await this.client.models.list();
      return models;
    } catch (error) {
      console.error("Failed to get Models from OpenRouter:", error);
      throw error;
    }
  }
}
