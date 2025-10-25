import { sql } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';

export interface CreateHistoryRequest {
  title?: string;
  type?: string;
}

export interface History {
  id: string;
  userId: string;
  title: string;
  type: string;
  createdAt: Date;
  lastUpdated: Date;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export class HistoryService {
  async createHistory(userId: string, request: CreateHistoryRequest): Promise<History> {
    const historyId = uuidv4();
    const now = new Date();
    const title = request.title || 'New Chat';
    const type = request.type || 'free';

    const [history] = await sql`
      INSERT INTO history (id, user_id, title, type, created_at, last_updated)
      VALUES (${historyId}, ${userId}, ${title}, ${type}, ${now}, ${now})
      RETURNING *
    `;

    return {
      id: history.id,
      userId: history.user_id,
      title: history.title,
      type: history.type,
      createdAt: history.created_at,
      lastUpdated: history.last_updated,
    };
  }

  async getAllHistory(
    userId: string,
    search: string,
    pageNumber: number,
    pageSize: number
  ): Promise<Page<History>> {
    const offset = pageNumber * pageSize;
    const searchPattern = `%${search}%`;

    let histories;
    let countResult;

    if (search) {
      histories = await sql`
        SELECT * FROM history
        WHERE user_id = ${userId}
          AND title ILIKE ${searchPattern}
        ORDER BY last_updated DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;

      countResult = await sql`
        SELECT COUNT(*) as total FROM history
        WHERE user_id = ${userId}
          AND title ILIKE ${searchPattern}
      `;
    } else {
      histories = await sql`
        SELECT * FROM history
        WHERE user_id = ${userId}
        ORDER BY last_updated DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;

      countResult = await sql`
        SELECT COUNT(*) as total FROM history
        WHERE user_id = ${userId}
      `;
    }

    const total = parseInt(countResult[0].total);
    const totalPages = Math.ceil(total / pageSize);

    return {
      content: histories.map((h: any) => ({
        id: h.id,
        userId: h.user_id,
        title: h.title,
        type: h.type,
        createdAt: h.created_at,
        lastUpdated: h.last_updated,
      })),
      totalElements: total,
      totalPages,
      size: pageSize,
      number: pageNumber,
    };
  }

  async deleteHistory(userId: string, historyId: string): Promise<void> {
    await sql`
      DELETE FROM messages
      WHERE history_id = ${historyId}
        AND history_id IN (SELECT id FROM history WHERE user_id = ${userId})
    `;

    await sql`
      DELETE FROM history
      WHERE id = ${historyId} AND user_id = ${userId}
    `;
  }

  async deleteAllHistory(userId: string): Promise<void> {
    await sql`
      DELETE FROM messages
      WHERE history_id IN (SELECT id FROM history WHERE user_id = ${userId})
    `;

    await sql`
      DELETE FROM history
      WHERE user_id = ${userId}
    `;
  }

  async updateHistory(userId: string, history: Partial<History> & { id: string }): Promise<boolean> {
    const result = await sql`
      UPDATE history
      SET title = ${history.title || 'Untitled'},
          last_updated = NOW()
      WHERE id = ${history.id} AND user_id = ${userId}
    `;

    return result.count > 0;
  }
}
