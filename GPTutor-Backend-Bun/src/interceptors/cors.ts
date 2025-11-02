import { Context, Next } from 'hono';
import { cors as honoCors } from 'hono/cors';
import { config } from '../config/env';

export const corsMiddleware = honoCors({
  origin: config.corsAllowedOrigins,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'Content-Disposition'],
  maxAge: 600,
  credentials: true,
});
