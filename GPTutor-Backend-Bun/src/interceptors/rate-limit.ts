import { Context, Next } from 'hono';
import { rateLimiter } from '../utils/rate-limiter';

export async function rateLimitMiddleware(c: Context, next: Next) {
  const userId = c.get('vkUserId') as string | undefined;

  if (!userId) {
    return next();
  }

  const path = c.req.path;
  const method = c.req.method;
  const key = `${userId}:${path}`;

  const capacity = getRateLimitCapacity(path, method);

  if (!rateLimiter.tryConsume(key, capacity, 1)) {
    return c.json({
      error: 'Too Many Requests',
      message: 'Превышено количество запросов в минуту, попробуйте позже',
    }, 429);
  }

  return next();
}

function getRateLimitCapacity(path: string, method: string): number {
  if (path.startsWith('/image') && method === 'POST') {
    return 10;
  }

  if (path.startsWith('/conversation')) {
    return 6;
  }

  if (path.startsWith('/vk-doc/conversation')) {
    return 3;
  }

  if (path.startsWith('/vk')) {
    return 3;
  }

  return 100;
}
