import { describe, it, expect } from 'vitest';
import { RateLimiter } from '../../src/security/rate-limiter.js';

describe('RateLimiter', () => {
  it('should allow requests within limit', () => {
    const limiter = new RateLimiter({ maxRequests: 10, windowMs: 1000 });

    for (let i = 0; i < 10; i++) {
      expect(limiter.tryAcquire()).toBe(true);
    }
  });

  it('should deny requests exceeding limit', () => {
    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });

    for (let i = 0; i < 5; i++) {
      limiter.tryAcquire();
    }

    expect(limiter.tryAcquire()).toBe(false);
  });

  it('should refill tokens over time', async () => {
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 100 });

    limiter.tryAcquire();
    limiter.tryAcquire();
    expect(limiter.tryAcquire()).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(limiter.tryAcquire()).toBe(true);
  });

  it('should reset limiter', () => {
    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });

    for (let i = 0; i < 5; i++) {
      limiter.tryAcquire();
    }

    limiter.reset();
    expect(limiter.tryAcquire()).toBe(true);
  });

  it('should report correct token count', () => {
    const limiter = new RateLimiter({ maxRequests: 10, windowMs: 1000 });

    expect(limiter.getTokenCount()).toBe(10);
    limiter.tryAcquire();
    expect(limiter.getTokenCount()).toBe(9);
  });
});
