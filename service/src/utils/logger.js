import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Formato personalizado para los logs
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    })
);

// Configuración del logger
const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        // Log de errores en archivo separado
        new winston.transports.File({
            filename: path.join(__dirname, 'logs', 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Log combinado de todo
        new winston.transports.File({
            filename: path.join(__dirname, 'logs', 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Consola con colores
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp({ format: 'HH:mm:ss' }),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} ${level}: ${message}`;
                })
            ),
        }),
    ],
});

// Sobrescribir console.log, console.error, etc. para usar el logger
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

console.log = (...args) => {
    logger.info(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));
    originalConsoleLog.apply(console, args);
};

console.error = (...args) => {
    logger.error(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));
    originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
    logger.warn(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));
    originalConsoleWarn.apply(console, args);
};

console.info = (...args) => {
    logger.info(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));
    originalConsoleInfo.apply(console, args);
};

// Exportar el logger por si se necesita usar directamente
export default logger;
