import { Hono } from 'hono';
import { HistoryService } from '../services/history.service';

const historyService = new HistoryService();

export const historyController = new Hono();

historyController.post('/history', async (c) => {
  const userId = c.get('vkUserId') as string;
  const body = await c.req.json();

  const history = await historyService.createHistory(userId, body);
  return c.json(history);
});

historyController.get('/history', async (c) => {
  const userId = c.get('vkUserId') as string;
  const pageNumber = parseInt(c.req.query('pageNumber') || '0');
  const pageSize = parseInt(c.req.query('pageSize') || '10');
  const search = c.req.query('search') || '';

  const histories = await historyService.getAllHistory(userId, search, pageNumber, pageSize);
  return c.json(histories);
});

historyController.delete('/history/:id', async (c) => {
  const userId = c.get('vkUserId') as string;
  const historyId = c.req.param('id');

  await historyService.deleteHistory(userId, historyId);
  return c.json({});
});

historyController.delete('/history', async (c) => {
  const userId = c.get('vkUserId') as string;

  await historyService.deleteAllHistory(userId);
  return c.json({});
});

historyController.put('/history', async (c) => {
  const userId = c.get('vkUserId') as string;
  const body = await c.req.json();

  const result = await historyService.updateHistory(userId, body);
  return c.json(result);
});
