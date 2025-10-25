import { Context, Next } from 'hono';
import { parseAuthHeader } from '../utils/auth';

export async function authMiddleware(c: Context, next: Next) {
  const path = c.req.path;
  const method = c.req.method;

  // Skip auth for OPTIONS and /purchase endpoint
  if (method === 'OPTIONS' || path === '/purchase') {
    return next();
  }

  const authHeader = c.req.header('Authorization');
  const authResult = parseAuthHeader(authHeader || null);

  if (!authResult) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Set auth context
  c.set('vkUserId', authResult.vkUserId);
  c.set('vkAppId', authResult.vkAppId);
  c.set('isTG', authResult.isTG);

  return next();
}
