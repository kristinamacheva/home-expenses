class AppError extends Error {
    constructor(message, statusCode, errors = []) {
        super(message);
        this.statusCode = statusCode || 500;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = { AppError };