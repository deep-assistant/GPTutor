import { Hono } from 'hono';
import { ImageService } from '../services/image.service';

const imageService = new ImageService();

export const imageController = new Hono();

imageController.post('/image', async (c) => {
  const userId = c.get('vkUserId') as string;
  const body = await c.req.json();

  const images = await imageService.generateImage(userId, body);
  return c.json(images);
});

imageController.post('/image/generate', async (c) => {
  const body = await c.req.json();
  const [imageUrls] = await imageService.getGeneratedImage(body);
  return c.json(imageUrls);
});

imageController.get('/image', async (c) => {
  const userId = c.get('vkUserId') as string;
  const pageNumber = parseInt(c.req.query('pageNumber') || '0');
  const pageSize = parseInt(c.req.query('pageSize') || '10');

  const images = await imageService.getImages(userId, pageNumber, pageSize);
  return c.json(images);
});

imageController.get('/publishing', async (c) => {
  const pageNumber = parseInt(c.req.query('pageNumber') || '0');
  const pageSize = parseInt(c.req.query('pageSize') || '50');
  const queryOriginalPrompt = c.req.query('queryOriginalPrompt') || '';

  const images = await imageService.getPublishingImages(queryOriginalPrompt, pageNumber, pageSize);
  return c.json(images);
});

imageController.get('/image/:id/base64', async (c) => {
  const imageId = c.req.param('id');
  const base64 = await imageService.getImageBase64(imageId);
  return c.text(base64);
});

// Placeholder endpoints for complaints and likes
imageController.post('/image/:id/complaint', async (c) => {
  const userId = c.get('vkUserId') as string;
  const imageId = c.req.param('id');

  // TODO: Implement complaint service
  return c.json({ id: imageId, userId, createdAt: new Date() });
});

imageController.post('/image/:id/like', async (c) => {
  const userId = c.get('vkUserId') as string;
  const imageId = c.req.param('id');

  // TODO: Implement like service
  return c.json({ id: imageId, userId, createdAt: new Date() });
});
