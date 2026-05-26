const { createLogger, transports, format } = require('winston');

const logger = createLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : "info",

    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
    ),

    transports: [
        new transports.File({
            filename: 'logs/error.log',
            level: "error"
        }),
        new transports.File({
            filename: 'logs/combined.log'
        }),
    ]
});

// add console ONLY in dev
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        })
    );
}

module.exports = logger;