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
