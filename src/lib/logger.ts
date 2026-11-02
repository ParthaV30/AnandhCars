/**
 * Production-ready logger with structured logging
 * Replaces console.log with structured, leveled logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  traceId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel: LogLevel = 'info';

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logLevel];
  }

  private formatEntry(level: LogLevel, message: string, context?: Record<string, unknown>, traceId?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      traceId,
    };
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const output = JSON.stringify(entry);

    if (this.isDevelopment) {
      // Pretty print in development
      const colors = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m', // red
      };
      const reset = '\x1b[0m';
      const color = colors[entry.level] || '';
      console.log(`${color}[${entry.level.toUpperCase()}]${reset} ${entry.message}`, entry.context ? entry.context : '');
    } else {
      // Structured JSON in production
      console.log(output);
    }
  }

  debug(message: string, context?: Record<string, unknown>, traceId?: string): void {
    this.output(this.formatEntry('debug', message, context, traceId));
  }

  info(message: string, context?: Record<string, unknown>, traceId?: string): void {
    this.output(this.formatEntry('info', message, context, traceId));
  }

  warn(message: string, context?: Record<string, unknown>, traceId?: string): void {
    this.output(this.formatEntry('warn', message, context, traceId));
  }

  error(message: string, context?: Record<string, unknown>, traceId?: string): void {
    this.output(this.formatEntry('error', message, context, traceId));
  }

  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}

export const logger = new Logger();

// Helper for audit logging
export function auditLog(action: string, userId: string, entityType: string, entityId: string, details: Record<string, unknown>): void {
  logger.info(`AUDIT: ${action}`, {
    audit: true,
    action,
    userId,
    entityType,
    entityId,
    details,
  });
}

export default logger;