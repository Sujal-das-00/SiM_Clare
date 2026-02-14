import logger from "../utils/looger.js";

export const errorhandler = (err, req, res, next) => {
    const statusCode = err.status || err.statusCode || 500;
    logger.error(err.message, {
        statusCode: statusCode,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        body: req.body ? JSON.stringify(req.body) : undefined,
        params: req.params ? JSON.stringify(req.params) : undefined,
        query: req.query ? JSON.stringify(req.query) : undefined,
        userId: req.user?.id || req.userId || 'unauthenticated', // if you have auth
        timestamp: new Date().toISOString()
    });

    // Send response to client
    res.status(statusCode).json({
        status: statusCode,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};