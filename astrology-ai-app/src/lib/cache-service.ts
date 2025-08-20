/**
 * Simple in-memory cache service for immediate performance gains
 * This provides instant caching until Redis is set up
 */

interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number; // Time to live in milliseconds
}

class SimpleCacheService {
	private cache = new Map<string, CacheEntry<any>>();
	private maxSize = 100; // Prevent memory leaks

	/**
	 * Get item from cache
	 */
	get<T>(key: string): T | null {
		const entry = this.cache.get(key);

		if (!entry) {
			return null;
		}

		// Check if expired
		if (Date.now() - entry.timestamp > entry.ttl) {
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	/**
	 * Set item in cache
	 */
	set<T>(key: string, data: T, ttlSeconds: number = 300): void {
		// Prevent memory leaks by removing oldest entries
		if (this.cache.size >= this.maxSize) {
			const firstKey = this.cache.keys().next().value;
			this.cache.delete(firstKey);
		}

		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl: ttlSeconds * 1000,
		});
	}

	/**
	 * Delete item from cache
	 */
	delete(key: string): boolean {
		return this.cache.delete(key);
	}

	/**
	 * Clear all cache
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Get cache statistics
	 */
	getStats() {
		return {
			size: this.cache.size,
			maxSize: this.maxSize,
			keys: Array.from(this.cache.keys()),
		};
	}

	/**
	 * Clean up expired entries
	 */
	cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > entry.ttl) {
				this.cache.delete(key);
			}
		}
	}
}

// Create singleton instance
export const cacheService = new SimpleCacheService();

// Cleanup expired entries every 5 minutes
if (typeof window !== "undefined") {
	setInterval(() => {
		cacheService.cleanup();
	}, 5 * 60 * 1000);
}

/**
 * Generate cache key for birth chart
 */
export function generateChartCacheKey(birthDetails: {
	day: string;
	month: string;
	year: string;
	hours: string;
	minutes: string;
	placeOfBirth: string;
}): string {
	const normalized = `${birthDetails.day}-${birthDetails.month}-${
		birthDetails.year
	}-${birthDetails.hours}-${birthDetails.minutes}-${birthDetails.placeOfBirth
		.toLowerCase()
		.trim()}`;
	return `chart:${btoa(normalized).substring(0, 16)}`;
}

/**
 * Generate cache key for AI predictions
 */
export function generatePredictionCacheKey(
	messages: any[],
	birthDetails?: any
): string {
	const lastMessage = messages[messages.length - 1]?.content || "";
	const birthKey = birthDetails
		? generateChartCacheKey(birthDetails)
		: "no-birth";
	const messageHash = btoa(lastMessage.substring(0, 100)).substring(0, 16);
	return `prediction:${birthKey}:${messageHash}`;
}

/**
 * Cache wrapper for async functions
 */
export async function withCache<T>(
	key: string,
	fn: () => Promise<T>,
	ttlSeconds: number = 300
): Promise<T> {
	// Try to get from cache first
	const cached = cacheService.get<T>(key);
	if (cached !== null) {
		console.log(`Cache hit: ${key}`);
		return cached;
	}

	// Execute function and cache result
	console.log(`Cache miss: ${key}`);
	const result = await fn();
	cacheService.set(key, result, ttlSeconds);
	return result;
}
