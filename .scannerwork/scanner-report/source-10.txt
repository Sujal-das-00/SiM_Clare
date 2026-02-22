import logger from "../utils/looger.js";

export const errorhandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    logger.error(err.message, {
        statusCode,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        body: req.body ? JSON.stringify(req.body) : undefined,
        params: req.params ? JSON.stringify(req.params) : undefined,
        query: req.query ? JSON.stringify(req.query) : undefined,
        userId: req.user?.id || 'unauthenticated',
        timestamp: new Date().toISOString()
    });

    res.status(statusCode).json({
        status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
        message: err.message
        
    });
};
