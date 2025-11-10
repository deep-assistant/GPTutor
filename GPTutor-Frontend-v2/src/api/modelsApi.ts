import { API_BASE_URL } from "./config.js";

export interface ModelData {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: number;
    completion: number;
    request: number;
    image: number;
    web_search: number;
    internal_reasoning: number;
  };
  context_length: number;
  architecture: {
    modality: string;
    input_modalities: string[];
    output_modalities: string[];
    tokenizer: string;
    instruct_type: string | null;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens: number;
    is_moderated: boolean;
  };
  supported_parameters: string[];
}

export interface ProcessedModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  price: string;
  contextLength: number;
  inputModalities: string[];
  isPopular: boolean;
}

export interface ModelsResponse {
  success: boolean;
  data: {
    models: ModelData[];
  };
}

class ModelsApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async getModels(): Promise<ModelsResponse> {
    return this.makeRequest<ModelsResponse>("/v1/models");
  }
}

export const modelsApi = new ModelsApiService();
