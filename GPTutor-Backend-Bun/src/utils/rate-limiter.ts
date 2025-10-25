/**
 * Simple token bucket rate limiter implementation
 */
export class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();

  getBucket(key: string, capacity: number): TokenBucket {
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = new TokenBucket(capacity);
      this.buckets.set(key, bucket);
    }
    return bucket;
  }

  tryConsume(key: string, capacity: number, tokens: number = 1): boolean {
    const bucket = this.getBucket(key, capacity);
    return bucket.tryConsume(tokens);
  }

  cleanup() {
    // Clean up old buckets periodically
    const now = Date.now();
    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > 300000) { // 5 minutes
        this.buckets.delete(key);
      }
    }
  }
}

class TokenBucket {
  private tokens: number;
  private readonly capacity: number;
  private readonly refillRate: number;
  public lastRefill: number;

  constructor(capacity: number, refillIntervalMs: number = 60000) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = capacity / refillIntervalMs;
    this.lastRefill = Date.now();
  }

  private refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  tryConsume(tokens: number): boolean {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }
}

export const rateLimiter = new RateLimiter();

// Clean up old buckets every 5 minutes
setInterval(() => rateLimiter.cleanup(), 300000);
