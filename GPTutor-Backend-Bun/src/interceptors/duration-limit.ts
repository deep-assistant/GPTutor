import { Context, Next } from 'hono';

interface DurationLimit {
  path: string;
  method: string;
  maxRequests: number;
  durationSeconds: number;
}

const durationLimits: DurationLimit[] = [
  {
    path: '/image',
    method: 'POST',
    maxRequests: 1,
    durationSeconds: 5,
  },
];

const requestTimestamps = new Map<string, number[]>();

export async function durationLimitMiddleware(c: Context, next: Next) {
  const userId = c.get('vkUserId') as string | undefined;

  if (!userId) {
    return next();
  }

  const path = c.req.path;
  const method = c.req.method;

  const limit = durationLimits.find(
    (l) => path.startsWith(l.path) && l.method === method
  );

  if (!limit) {
    return next();
  }

  const key = `${userId}:${limit.path}:${limit.method}`;
  const now = Date.now();
  const windowMs = limit.durationSeconds * 1000;

  // Get timestamps for this user/endpoint
  let timestamps = requestTimestamps.get(key) || [];

  // Remove old timestamps outside the window
  timestamps = timestamps.filter((ts) => now - ts < windowMs);

  // Check if limit exceeded
  if (timestamps.length >= limit.maxRequests) {
    const oldestTimestamp = timestamps[0];
    const resetTime = Math.ceil((oldestTimestamp + windowMs - now) / 1000);

    return c.json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${resetTime} seconds.`,
    }, 429);
  }

  // Add current timestamp
  timestamps.push(now);
  requestTimestamps.set(key, timestamps);

  return next();
}

// Cleanup old entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of requestTimestamps.entries()) {
    const filtered = timestamps.filter((ts) => now - ts < 300000); // 5 minutes
    if (filtered.length === 0) {
      requestTimestamps.delete(key);
    } else {
      requestTimestamps.set(key, filtered);
    }
  }
}, 60000);
