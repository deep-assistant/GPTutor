import { Hono } from 'hono';
import { ConversationService } from '../services/conversation.service';

const conversationService = new ConversationService();

export const conversationController = new Hono();

conversationController.post('/vk-doc/conversation', async (c) => {
  const body = await c.req.json();
  const result = await conversationService.getConversationVKDoc(body);
  return c.text(result);
});

conversationController.post('/conversation', async (c) => {
  const userId = c.get('vkUserId') as string;
  const body = await c.req.json();

  const result = await conversationService.getConversation(body, userId);
  return c.json(result);
});
