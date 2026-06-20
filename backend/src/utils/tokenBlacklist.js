// In-memory token blacklist (replaces Redis for logout token revocation)
const blacklist = new Map();

const blacklistToken = (token, ttlSeconds = 15 * 60) => {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  blacklist.set(token, expiresAt);
};

const isTokenBlacklisted = (token) => {
  const expiresAt = blacklist.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    blacklist.delete(token);
    return false;
  }
  return true;
};

// Periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now();
  for (const [token, expiresAt] of blacklist.entries()) {
    if (now > expiresAt) blacklist.delete(token);
  }
}, 60 * 1000).unref();

module.exports = { blacklistToken, isTokenBlacklisted };
