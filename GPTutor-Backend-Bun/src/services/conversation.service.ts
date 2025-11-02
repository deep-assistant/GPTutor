import { config } from '../config/env';

export interface ConversationRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
  model?: string;
  stream?: boolean;
}

export class ConversationService {
  async getConversation(request: ConversationRequest, userId: string): Promise<any> {
    // Forward request to Models service
    const response = await fetch(`${config.modelsUrl}/llm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Models service error: ${response.statusText}`);
    }

    return await response.json();
  }

  async getConversationVKDoc(request: { question: string }): Promise<string> {
    // Forward request to RAG service
    const response = await fetch(`${config.ragUrl}/doc-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`RAG service error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.answer || data;
  }
}
