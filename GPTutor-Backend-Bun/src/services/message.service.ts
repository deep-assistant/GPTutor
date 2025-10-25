import { sql } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';

export interface CreateMessageRequest {
  historyId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
}

export interface Message {
  id: string;
  historyId: string;
  content: string;
  role: string;
  createdAt: Date;
  userId: string;
}

export class MessageService {
  async createMessage(userId: string, request: CreateMessageRequest): Promise<Message> {
    const messageId = uuidv4();
    const now = new Date();

    const [message] = await sql`
      INSERT INTO messages (id, history_id, user_id, content, role, created_at)
      VALUES (${messageId}, ${request.historyId}, ${userId}, ${request.content}, ${request.role}, ${now})
      RETURNING *
    `;

    return {
      id: message.id,
      historyId: message.history_id,
      content: message.content,
      role: message.role,
      createdAt: message.created_at,
      userId: message.user_id,
    };
  }

  async getMessagesByHistoryId(userId: string, historyId: string): Promise<Message[]> {
    const messages = await sql`
      SELECT m.*
      FROM messages m
      JOIN history h ON m.history_id = h.id
      WHERE m.history_id = ${historyId}
        AND h.user_id = ${userId}
      ORDER BY m.created_at ASC
    `;

    return messages.map((m: any) => ({
      id: m.id,
      historyId: m.history_id,
      content: m.content,
      role: m.role,
      createdAt: m.created_at,
      userId: m.user_id,
    }));
  }

  async getJSONExportData(userId: string, historyId: string): Promise<[string, string]> {
    const messages = await this.getMessagesByHistoryId(userId, historyId);
    const exportData = {
      historyId,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.createdAt.toISOString(),
      })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const filename = `chat-export-${historyId}.json`;

    return [jsonString, filename];
  }

  async getTXTExportData(userId: string, historyId: string): Promise<[string, string]> {
    const messages = await this.getMessagesByHistoryId(userId, historyId);

    const txtContent = messages
      .map((m) => {
        const timestamp = m.createdAt.toISOString();
        return `[${timestamp}] ${m.role.toUpperCase()}:\n${m.content}\n`;
      })
      .join('\n---\n\n');

    const filename = `chat-export-${historyId}.txt`;

    return [txtContent, filename];
  }
}
