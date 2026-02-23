import { rateLimit } from 'express-rate-limit';

const limiter = (wi, li) => {
    return rateLimit({
        windowMs: wi,
        limit: li,
        statusCode: 429,
        message: { status: 'fail', message: 'Too many requests, please try again later.' }, // ✅ add this
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        ipv6Subnet: 56,
        skipFailedRequests: true,
        skipSuccessfulRequests: false
    });
};

export default limiter;