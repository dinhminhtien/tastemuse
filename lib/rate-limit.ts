/**
 * API Rate Limiting
 * Token bucket algorithm with per-IP/user limits
 *
 * TasteMuse – Security Layer
 */

/* =====================================================
 * IN-MEMORY RATE LIMITER (Vercel compatible)
 * ===================================================== */

interface RateLimitEntry {
    tokens: number;
    lastRefill: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
    maxTokens: number;       // Max tokens in bucket
    refillRate: number;      // Tokens per second
    tokensPerRequest: number; // Tokens consumed per request
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
    chat: {
        maxTokens: 10,
        refillRate: 0.5,        // 1 token per 2 seconds
        tokensPerRequest: 1,
    },
    api: {
        maxTokens: 30,
        refillRate: 2,          // 2 tokens per second
        tokensPerRequest: 1,
    },
    embedding: {
        maxTokens: 5,
        refillRate: 0.2,        // 1 token per 5 seconds
        tokensPerRequest: 1,
    },
};

/**
 * Check if a request is rate limited
 * @returns { allowed: true } or { allowed: false, retryAfter: seconds }
 */
export function checkRateLimit(
    identifier: string,
    configName: string = 'api'
): { allowed: boolean; retryAfter?: number; remaining?: number } {
    const config = DEFAULT_CONFIGS[configName] || DEFAULT_CONFIGS.api;
    const now = Date.now() / 1000; // Current time in seconds

    let entry = rateLimitStore.get(identifier);

    if (!entry) {
        entry = {
            tokens: config.maxTokens,
            lastRefill: now,
        };
        rateLimitStore.set(identifier, entry);
    }

    // Refill tokens based on elapsed time
    const elapsed = now - entry.lastRefill;
    entry.tokens = Math.min(
        config.maxTokens,
        entry.tokens + elapsed * config.refillRate
    );
    entry.lastRefill = now;

    // Check if enough tokens
    if (entry.tokens < config.tokensPerRequest) {
        const waitTime = (config.tokensPerRequest - entry.tokens) / config.refillRate;
        return {
            allowed: false,
            retryAfter: Math.ceil(waitTime),
            remaining: 0,
        };
    }

    // Consume tokens
    entry.tokens -= config.tokensPerRequest;

    return {
        allowed: true,
        remaining: Math.floor(entry.tokens),
    };
}

/**
 * Get rate limit identifier from request
 * Uses IP address for anonymous users, user ID for authenticated
 */
export function getRateLimitKey(
    request: Request,
    userId?: string
): string {
    if (userId) return `user:${userId}`;

    // Try to get IP from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown';

    return `ip:${ip}`;
}

/**
 * Cleanup old entries (run periodically)
 */
export function cleanupRateLimitStore(): void {
    const now = Date.now() / 1000;
    const maxAge = 3600; // 1 hour

    for (const [key, entry] of rateLimitStore.entries()) {
        if (now - entry.lastRefill > maxAge) {
            rateLimitStore.delete(key);
        }
    }
}

// Run cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupRateLimitStore, 10 * 60 * 1000);
}
