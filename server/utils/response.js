export const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
    res.status(statusCode).json({
        success: true,
        message,
        ...(data !== null && { data }),
        ...(meta && { meta })
    });
};
