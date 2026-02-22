export const handelResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data,
    });
};
