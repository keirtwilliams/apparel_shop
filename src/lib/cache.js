/**
 * Purgatory High-Performance Tiered Client Cache
 * 
 * Features:
 * 1. Tier 1 (L1): In-Memory RAM Cache with LRU Eviction & microsecond response
 * 2. Tier 2 (L2): Persistent Storage with TTL (Time-To-Live) and auto-expiration
 * 3. Tagged Cache Invalidation (e.g., invalidate all 'products' or 'pricing' entries)
 * 4. Stale-While-Revalidate (SWR) fetching helper
 * 5. Background Image Preload Cache for zero-latency hover flips and transitions
 * 6. Quota-Safe storage fallback (prevents browser QuotaExceededError crashes)
 */

class TieredCache {
  constructor(options = {}) {
    this.l1 = new Map(); // RAM L1 Cache
    this.maxMemoryItems = options.maxMemoryItems || 150;
    this.storagePrefix = options.storagePrefix || 'purgatory_cache_';
    this.tagsMap = new Map(); // Tag -> Set of keys
  }

  /**
   * Set a value in cache with optional TTL (ms) and invalidation tags
   */
  set(key, value, { ttlMs = 5 * 60 * 1000, tags = [], persist = true } = {}) {
    const expireAt = ttlMs ? Date.now() + ttlMs : null;
    const entry = { value, expireAt, tags, createdAt: Date.now() };

    // 1. Write to L1 Memory
    if (this.l1.size >= this.maxMemoryItems) {
      // LRU eviction: remove oldest key
      const oldestKey = this.l1.keys().next().value;
      this.l1.delete(oldestKey);
    }
    this.l1.set(key, entry);

    // Track tags
    tags.forEach(tag => {
      if (!this.tagsMap.has(tag)) {
        this.tagsMap.set(tag, new Set());
      }
      this.tagsMap.get(tag).add(key);
    });

    // 2. Write to L2 Persistent Storage if enabled
    if (persist && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const payload = JSON.stringify(entry);
        window.sessionStorage.setItem(`${this.storagePrefix}${key}`, payload);
      } catch (err) {
        // Quota exceeded: prune L2 storage safely
        this.pruneStorage();
      }
    }

    return value;
  }

  /**
   * Get value from L1 or L2 cache
   */
  get(key) {
    // Check L1
    if (this.l1.has(key)) {
      const entry = this.l1.get(key);
      if (!entry.expireAt || entry.expireAt > Date.now()) {
        // Move to end for LRU refresh
        this.l1.delete(key);
        this.l1.set(key, entry);
        return entry.value;
      }
      // Expired in L1
      this.delete(key);
      return null;
    }

    // Check L2 Storage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const raw = window.sessionStorage.getItem(`${this.storagePrefix}${key}`);
        if (raw) {
          const entry = JSON.parse(raw);
          if (!entry.expireAt || entry.expireAt > Date.now()) {
            // Re-populate L1
            this.l1.set(key, entry);
            return entry.value;
          }
          // Expired in L2
          this.delete(key);
        }
      } catch (e) {
        /* ignore parse or storage errors */
      }
    }

    return null;
  }

  /**
   * Check if a valid, unexpired key exists
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Delete key from L1 and L2
   */
  delete(key) {
    this.l1.delete(key);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.removeItem(`${this.storagePrefix}${key}`);
      } catch (e) { /* ignore */ }
    }
  }

  /**
   * Invalidate all cache entries matching a tag (e.g. 'products', 'pricing')
   */
  invalidateTag(tag) {
    const keys = this.tagsMap.get(tag);
    if (keys) {
      keys.forEach(k => this.delete(k));
      this.tagsMap.delete(tag);
    }
  }

  /**
   * Cache-Aside / Stale-While-Revalidate pattern
   */
  async getOrSet(key, fetcherFn, options = {}) {
    const cached = this.get(key);
    if (cached !== null) {
      // If SWR requested, revalidate asynchronously
      if (options.swr) {
        Promise.resolve().then(async () => {
          try {
            const fresh = await fetcherFn();
            this.set(key, fresh, options);
          } catch (e) {
            // SWR background refresh failed silently
          }
        });
      }
      return cached;
    }

    // Cache miss: execute fetcher
    const fresh = await fetcherFn();
    this.set(key, fresh, options);
    return fresh;
  }

  /**
   * Safely prune expired and old entries from sessionStorage
   */
  pruneStorage() {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    try {
      const keysToRemove = [];
      const now = Date.now();
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const k = window.sessionStorage.key(i);
        if (k && k.startsWith(this.storagePrefix)) {
          try {
            const entry = JSON.parse(window.sessionStorage.getItem(k));
            if (entry.expireAt && entry.expireAt < now) {
              keysToRemove.push(k);
            }
          } catch (e) {
            keysToRemove.push(k);
          }
        }
      }
      keysToRemove.forEach(k => window.sessionStorage.removeItem(k));
    } catch (e) { /* ignore */ }
  }

  /**
   * Clear all L1 and L2 cache entries
   */
  clear() {
    this.l1.clear();
    this.tagsMap.clear();
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const keysToRemove = [];
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const k = window.sessionStorage.key(i);
          if (k && k.startsWith(this.storagePrefix)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => window.sessionStorage.removeItem(k));
      } catch (e) { /* ignore */ }
    }
  }
}

/**
 * Global singleton cache instance
 */
export const appCache = new TieredCache({ maxMemoryItems: 200 });

/**
 * Image Preload Cache:
 * Warms the browser's image decode cache in RAM so garment hover flips and
 * catalog image transitions occur with 0ms delay and zero layout shift.
 */
class ImagePreloader {
  constructor() {
    this.preloaded = new Set();
  }

  preload(url) {
    if (!url || typeof window === 'undefined' || this.preloaded.has(url)) return;
    this.preloaded.add(url);
    const img = new Image();
    img.src = url;
  }

  preloadMany(urls = []) {
    urls.filter(Boolean).forEach(url => this.preload(url));
  }
}

export const imageCache = new ImagePreloader();
