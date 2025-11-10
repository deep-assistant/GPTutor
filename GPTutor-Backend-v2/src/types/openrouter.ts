export interface OpenRouterPricing {
  prompt: string;           // Cost per input token
  completion: string;       // Cost per output token
  request: string;          // Fixed cost per API request
  image: string;           // Cost per image input
  web_search: string;      // Cost per web search operation
  internal_reasoning: string; // Cost for internal reasoning tokens
  input_cache_read?: string;   // Cost per cached input token read
  input_cache_write?: string;  // Cost per cached input token write
}

export interface OpenRouterArchitecture {
  modality: string;
  input_modalities: string[];
  output_modalities: string[];
  tokenizer: string;
  instruct_type: string | null;
}

export interface OpenRouterTopProvider {
  context_length: number;
  max_completion_tokens: number;
  is_moderated: boolean;
}

export interface OpenRouterDefaultParameters {
  temperature: number | null;
  top_p: number | null;
  frequency_penalty: number | null;
}

export interface OpenRouterModel {
  id: string;
  canonical_slug: string;
  hugging_face_id: string;
  name: string;
  created: number;
  description: string;
  context_length: number;
  architecture: OpenRouterArchitecture;
  pricing: OpenRouterPricing;
  top_provider: OpenRouterTopProvider;
  per_request_limits: any;
  supported_parameters: string[];
  default_parameters: OpenRouterDefaultParameters;
}

export interface OpenRouterApiResponse {
  data: OpenRouterModel[];
}

export interface CostCalculation {
  promptCostRub: number;
  completionCostRub: number;
  requestCostRub: number;
  imageCostRub: number;
  totalCostRub: number;
}

export interface UsageParams {
  promptTokens?: number;
  completionTokens?: number;
  images?: number;
  requests?: number;
}








