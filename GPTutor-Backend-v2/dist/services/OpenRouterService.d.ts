import OpenAI from "openai";
import type { ChatCompletion, ChatCompletionCreateParams } from "openai/resources/chat/completions";
export declare class OpenRouterService {
    private client;
    constructor(apiKey: string);
    createCompletion(params: ChatCompletionCreateParams): Promise<ChatCompletion>;
    createCompletionStream(params: ChatCompletionCreateParams): Promise<OpenAI.Chat.Completions.ChatCompletion & {
        _request_id?: string | null;
    } & import("openai/core/streaming").Stream<OpenAI.Chat.Completions.ChatCompletionChunk>>;
    getModels(): Promise<OpenAI.Models.ModelsPage>;
}
