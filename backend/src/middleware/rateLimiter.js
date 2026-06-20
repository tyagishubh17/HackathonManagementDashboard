// Rate limiters disabled for development/testing
const authLimiter = (req, res, next) => next();
const apiLimiter = (req, res, next) => next();

module.exports = { authLimiter, apiLimiter };
