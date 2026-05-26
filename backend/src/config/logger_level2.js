const { createLogger, transports, format } = require("winston");

/**
 * ✅ Helper: filter logs by label
 * This runs inside transport pipeline, NOT at startup
 */
const filterByLabel = (label) =>
    format((info) => {
        return info.label === label ? info : false;
    });

/**
 * ✅ Main logger
 */
const logger = createLogger({
    level:
        process.env.NODE_ENV === "development"
            ? "debug"
            : process.env.NODE_ENV === "testing"
            ? "warn"
            : "info",

    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
    ),

    transports: [
        // 🧠 global logs (everything goes here)
        new transports.File({
            filename: "logs/combined.log"
        }),

        // 🧠 error-only logs
        new transports.File({
            filename: "logs/error.log",
            level: "error"
        }),

        // 🧠 DB-specific logs
        new transports.File({
            filename: "logs/db.log",
            format: format.combine(
                filterByLabel("db"),
                format.timestamp(),
                format.errors({ stack: true }),
                format.json()
            )
        })
    ]
});

module.exports = logger;