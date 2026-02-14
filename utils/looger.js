import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

// Define separate directories for each log type
const logsDir = path.join(process.cwd(), "logs");
const appLogsDir = path.join(logsDir, "app");
const jsonLogsDir = path.join(logsDir, "json");
const exceptionsLogsDir = path.join(logsDir, "exceptions");
const rejectionsLogsDir = path.join(logsDir, "rejections");
const auditLogsDir = path.join(logsDir, "audit");

// Create all directories
[logsDir, appLogsDir, jsonLogsDir, exceptionsLogsDir, rejectionsLogsDir, auditLogsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Human-readable log transport
const fileTransport = new DailyRotateFile({
    filename: path.join(appLogsDir, "%DATE%-app.log"),
    datePattern: "DD-MM-YYYY",
    zippedArchive: false,
    maxSize: "20m",
    maxFiles: "14d",
    level: "error",
    auditFile: path.join(auditLogsDir, "app-audit.json")
});

// JSON log transport with proper formatting
const jsonTransport = new DailyRotateFile({
    filename: path.join(jsonLogsDir, "%DATE%-app.json"),
    datePattern: "DD-MM-YYYY",
    zippedArchive: false,
    maxSize: "20m",
    maxFiles: "14d",
    level: "error",
    format: winston.format.combine(
        winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.json({ space: 2 }) // Pretty print JSON with 2 space indentation
    ),
    auditFile: path.join(auditLogsDir, "json-audit.json")
});

// Console transport for development
const consoleTransport = new winston.transports.Console({
    level: "error",
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
            return `[${timestamp}] ${level}: ${message}${stack ? "\n" + stack : ""}`;
        })
    )
});

const logger = winston.createLogger({
    level: "error",
    format: winston.format.combine(
        winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}${stack ? "\n" + stack : ""}`;
        })
    ),
    transports: [
        fileTransport,
        jsonTransport,
        consoleTransport
    ]
});

// Handle uncaught exceptions
logger.exceptions.handle(
    new DailyRotateFile({
        filename: path.join(exceptionsLogsDir, "%DATE%-exceptions.log"),
        datePattern: "DD-MM-YYYY",
        maxSize: "20m",
        maxFiles: "14d",
        format: winston.format.combine(
            winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
            winston.format.errors({ stack: true }),
            winston.format.json({ space: 2 })
        ),
        auditFile: path.join(auditLogsDir, "exceptions-audit.json")
    })
);

// Handle unhandled promise rejections
logger.rejections.handle(
    new DailyRotateFile({
        filename: path.join(rejectionsLogsDir, "%DATE%-rejections.log"),
        datePattern: "DD-MM-YYYY",
        maxSize: "20m",
        maxFiles: "14d",
        format: winston.format.combine(
            winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
            winston.format.errors({ stack: true }),
            winston.format.json({ space: 2 })
        ),
        auditFile: path.join(auditLogsDir, "rejections-audit.json")
    })
);

export default logger;


