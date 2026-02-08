import { RateLimitConfig } from '../types/index.js';

/**
 * Token bucket rate limiter for API request throttling
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;

  constructor(config: RateLimitConfig) {
    this.maxTokens = config.maxRequests;
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
    // Calculate refill rate: tokens per millisecond
    this.refillRate = config.maxRequests / config.windowMs;
  }

  /**
   * Try to acquire a token for making a request
   */
  tryAcquire(): boolean {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }

    return false;
  }

  /**
   * Refill tokens based on time elapsed
   */
  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Get current token count
   */
  getTokenCount(): number {
    this.refill();
    return Math.floor(this.tokens);
  }

  /**
   * Reset the rate limiter
   */
  reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }
}
