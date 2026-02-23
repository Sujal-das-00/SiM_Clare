import logger from "../utils/looger.js";

const TRUSTED_ERROR_NAMES = new Set([
    'AppError',
    'ValidationError',
    'NotFoundError',
    'AuthenticationError',
    'AuthorizationError',
    // add your own custom error classes here
]);

// Detect SQL driver errors (pg, mysql2, sequelize, etc.)
const isSqlError = (err) =>
    !!(err.code || err.errno || err.sqlState || err.sqlMessage);

const sanitizeBody = (body) => {
    if (!body) return undefined;
    const SENSITIVE_KEYS = ['password', 'token', 'secret', 'otp', 'pin'];
    const sanitized = { ...body };
    SENSITIVE_KEYS.forEach(key => {
        if (sanitized[key]) sanitized[key] = '[REDACTED]';
    });
    return JSON.stringify(sanitized);
};

export const errorhandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    logger.error(err.message, {
        statusCode,
        errorName: err.name,
        sqlCode: err.code || err.errno || undefined,
        sqlState: err.sqlState || undefined,
        sqlMessage: err.sqlMessage || undefined,
        detail: err.detail || undefined,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        body: sanitizeBody(req.body),
        params: req.params ? JSON.stringify(req.params) : undefined,
        query: req.query ? JSON.stringify(req.query) : undefined,
        userId: req.user?.id || 'unauthenticated',
        timestamp: new Date().toISOString(),
    });

    // Determine what the client actually sees
    let clientMessage;

    if (TRUSTED_ERROR_NAMES.has(err.name)) {
        // Your own errors — safe to expose
        clientMessage = err.message;
    } else if (isSqlError(err)) {
        // ANY sql error — never expose, even partially
        clientMessage = 'An internal server error occurred.';
    } else if (statusCode >= 500) {
        // Unknown 5xx (bcrypt, jwt internals, anything else)
        clientMessage = 'An internal server error occurred.';
    } else {
        // Unknown 4xx — still hide it to be safe
        clientMessage = 'Bad request.';
    }

    res.status(statusCode).json({
        status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
        message: clientMessage,
    });
};
