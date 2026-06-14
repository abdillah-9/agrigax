class AppError extends Error {
    constructor(message, statusCode = 500, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
        this.errors = errors;
    }
}

module.exports = AppError;
