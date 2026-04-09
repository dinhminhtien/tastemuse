import { Redis } from '@upstash/redis';

// Provide a safe initialization that doesn't crash if process.env is missing
const getRedisClient = () => {
    // If we're not running in an environment with the URL, disable caching gracefully
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return null;
    }

    try {
        return new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    } catch (error) {
        console.warn('⚠️ Failed to initialize Redis client. Caching disabled.', error);
        return null;
    }
};

export const redis = getRedisClient();

/**
 * Get a cached value by key
 * @param key The cache key
 * @returns The parsed value or null if not found/error
 */
export async function getCachedResponse(key: string) {
    if (!redis) return null;

    try {
        const data = await redis.get(key);
        return data; // @upstash/redis automatically parses JSON
    } catch (error) {
        console.warn(`⚠️ Redis GET error for key [${key}]:`, error);
        return null;
    }
}

/**
 * Set a value in the cache with expiration
 * @param key The cache key
 * @param value The value to cache (will be stringified if object)
 * @param ttlSeconds Expiration time in seconds (Default: 24h = 86400)
 */
export async function setCachedResponse(key: string, value: any, ttlSeconds: number = 86400) {
    if (!redis) return false;

    try {
        await redis.set(key, value, { ex: ttlSeconds });
        return true;
    } catch (error) {
        console.warn(`⚠️ Redis SET error for key [${key}]:`, error);
        return false;
    }
}

/**
 * Flush all RAG cache entries (keys starting with `rag_cache:`)
 * Useful when LLM config changes and stale responses need to be cleared.
 * @returns Number of keys deleted
 */
export async function flushRagCache(): Promise<number> {
    if (!redis) return 0;

    try {
        let cursor = '0';
        let totalDeleted = 0;

        do {
            const result: [string, string[]] = await redis.scan(cursor, { match: 'rag_cache:*', count: 100 });
            cursor = result[0];
            const keys = result[1];

            if (keys.length > 0) {
                await redis.del(...keys);
                totalDeleted += keys.length;
            }
        } while (cursor !== '0');

        console.log(`🗑️ Flushed ${totalDeleted} RAG cache entries`);
        return totalDeleted;
    } catch (error) {
        console.error('❌ Redis flush error:', error);
        return 0;
    }
}
