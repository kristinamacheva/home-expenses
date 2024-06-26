const { MongooseError, Error } = require("mongoose");

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Вътрешна грешка на сървъра";
    let errors = err.errors || [];

    // Check if the error is from Mongoose
    if (err instanceof MongooseError) {
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            statusCode = 400;
            message = 'Validation failed';
            errors = Object.values(err.errors).map(el => ({
                field: el.path,
                message: el.message
            }));
        }

        // Handle Mongoose duplicate key errors
        if (err.code && err.code === 11000) {
            statusCode = 400;
            const field = Object.keys(err.keyValue)[0];
            message = `Duplicate field value: ${err.keyValue[field]}. Please use another value!`;
        }

        // Handle Mongoose cast errors (invalid ObjectId)
        if (err.name === 'CastError') {
            statusCode = 400;
            message = `Invalid ObjectId: ${err.value}.`;
        }
    }

    console.error(err.stack);

    res.status(statusCode).json({
        // success: false,
        message,
        errors,
    });
}

module.exports = errorHandler;