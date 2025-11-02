import { Hono } from 'hono';
import { MessageService } from '../services/message.service';

const messageService = new MessageService();

export const messageController = new Hono();

messageController.post('/messages', async (c) => {
  const userId = c.get('vkUserId') as string;
  const body = await c.req.json();

  const message = await messageService.createMessage(userId, body);
  return c.json(message);
});

messageController.get('/messages/:historyId', async (c) => {
  const userId = c.get('vkUserId') as string;
  const historyId = c.req.param('historyId');

  const messages = await messageService.getMessagesByHistoryId(userId, historyId);
  return c.json(messages);
});

messageController.get('/messages/json/:historyId', async (c) => {
  const userId = c.get('vkUserId') as string;
  const historyId = c.req.param('historyId');

  const [jsonData, filename] = await messageService.getJSONExportData(userId, historyId);

  c.header('Content-Disposition', `attachment; filename=${filename}`);
  c.header('Content-Type', 'application/json');

  return c.text(jsonData);
});

messageController.get('/messages/txt/:historyId', async (c) => {
  const userId = c.get('vkUserId') as string;
  const historyId = c.req.param('historyId');

  const [txtData, filename] = await messageService.getTXTExportData(userId, historyId);

  c.header('Content-Disposition', `attachment; filename=${filename}`);
  c.header('Content-Type', 'text/plain');

  return c.text(txtData);
});
