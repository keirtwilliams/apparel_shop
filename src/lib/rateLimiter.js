/**
 * Purgatory Sliding-Window Rate Limiter & Security Engine
 * 
 * Protects critical client operations without requiring a live backend database:
 * 1. Double-Submit Prevention (2-second debounce on Order Creation)
 * 2. Order Flood Throttling (Max 3 orders / 60s per session)
 * 3. Coupon Brute-Force Defense (Max 5 code attempts / 60s, then 60s lockout)
 * 4. Admin Security Gate Protection (Max 3 failures / 15m lockout)
 * 5. Search / Filter query rate limit and debounce
 */

const DEFAULT_RULES = {
  // Prevent accidental double clicks and rapid automated order spam
  checkout_order: {
    maxRequests: 3,
    windowMs: 60 * 1000,
    minIntervalMs: 2500, // Enforces 2.5s between successive order clicks
    lockoutMs: 30 * 1000,
    label: 'Order Placement'
  },

  // Prevent automated dictionary attacks / brute forcing on coupon codes
  coupon_attempt: {
    maxRequests: 5,
    windowMs: 60 * 1000,
    lockoutMs: 60 * 1000, // 1-minute lockout if limit exceeded
    label: 'Promo Code Verification'
  },

  // Operator security gate defense
  admin_auth: {
    maxRequests: 3,
    windowMs: 15 * 60 * 1000,
    lockoutMs: 15 * 60 * 1000,
    label: 'Console Operator Login'
  },

  // Catalogue search throttle
  search_query: {
    maxRequests: 20,
    windowMs: 10 * 1000,
    minIntervalMs: 150,
    label: 'Product Search'
  }
};

class SlidingWindowRateLimiter {
  constructor(storagePrefix = 'purgatory_ratelimit_') {
    this.storagePrefix = storagePrefix;
  }

  _getKey(action) {
    return `${this.storagePrefix}${action}`;
  }

  _getState(action) {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return { timestamps: [], lockedUntil: null, lastRequestAt: 0 };
    }
    try {
      const raw = window.sessionStorage.getItem(this._getKey(action));
      if (!raw) return { timestamps: [], lockedUntil: null, lastRequestAt: 0 };
      return JSON.parse(raw);
    } catch (e) {
      return { timestamps: [], lockedUntil: null, lastRequestAt: 0 };
    }
  }

  _saveState(action, state) {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    try {
      window.sessionStorage.setItem(this._getKey(action), JSON.stringify(state));
    } catch (e) { /* ignore storage error */ }
  }

  /**
   * Check if action is currently permitted under rate limit rules
   * @param {string} action - Identifier (e.g. 'checkout_order', 'coupon_attempt')
   * @param {object} customConfig - Optional overrides
   * @returns {{ allowed: boolean, remaining: number, resetInSeconds: number, message: string }}
   */
  check(action, customConfig = {}) {
    const config = { ...(DEFAULT_RULES[action] || { maxRequests: 10, windowMs: 60000 }), ...customConfig };
    const state = this._getState(action);
    const now = Date.now();

    // 1. Check if actively locked out
    if (state.lockedUntil && state.lockedUntil > now) {
      const resetInSeconds = Math.ceil((state.lockedUntil - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds,
        message: `Too many attempts on ${config.label || action}. Please wait ${resetInSeconds}s before trying again.`
      };
    }

    // 2. Check minimum interval between requests (debounce / double-click protection)
    if (config.minIntervalMs && state.lastRequestAt && (now - state.lastRequestAt < config.minIntervalMs)) {
      const waitMs = config.minIntervalMs - (now - state.lastRequestAt);
      const waitSeconds = Math.ceil(waitMs / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: waitSeconds,
        message: `Action throttled. Please wait ${waitSeconds}s before retrying.`
      };
    }

    // 3. Filter timestamps strictly within the sliding window
    const validTimestamps = (state.timestamps || []).filter(t => now - t < config.windowMs);

    // 4. Check if quota exceeded
    if (validTimestamps.length >= config.maxRequests) {
      const oldest = validTimestamps[0];
      const resetInSeconds = Math.ceil((config.windowMs - (now - oldest)) / 1000);

      // Trigger lockout if configured
      if (config.lockoutMs) {
        state.lockedUntil = now + config.lockoutMs;
        this._saveState(action, state);
      }

      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: Math.max(1, resetInSeconds),
        message: `Rate limit exceeded for ${config.label || action}. Try again in ${Math.max(1, resetInSeconds)}s.`
      };
    }

    const remaining = config.maxRequests - validTimestamps.length;
    return {
      allowed: true,
      remaining,
      resetInSeconds: 0,
      message: ''
    };
  }

  /**
   * Record an action execution into the rate limit window
   */
  record(action) {
    const state = this._getState(action);
    const now = Date.now();
    const config = DEFAULT_RULES[action] || { windowMs: 60000 };

    const validTimestamps = (state.timestamps || []).filter(t => now - t < config.windowMs);
    validTimestamps.push(now);

    state.timestamps = validTimestamps;
    state.lastRequestAt = now;
    this._saveState(action, state);
  }

  /**
   * Reset rate limit state for a given action
   */
  reset(action) {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    window.sessionStorage.removeItem(this._getKey(action));
  }
}

export const rateLimiter = new SlidingWindowRateLimiter();
