/**
 * Structured Logging Service
 * Provides consistent logging across the application with levels and context
 */

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogContext {
  [key: string]: unknown
}

interface Logger {
  debug: (message: string, context?: LogContext) => void
  info: (message: string, context?: LogContext) => void
  warn: (message: string, context?: LogContext) => void
  error: (message: string, error?: Error | unknown, context?: LogContext) => void
}

class LoggerService implements Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error | unknown) {
    const timestamp = new Date().toISOString();
    
    const logData: Record<string, unknown> = {
      timestamp,
      level,
      message,
    };
    
    if (context) {
      logData.context = context;
    }
    
    if (error) {
      logData.error = this.formatError(error);
    }

    // In development, use console for better DX
    if (this.isDevelopment) {
      const consoleMethod = level === "error" ? "error" : level === "warn" ? "warn" : "log";
      console[consoleMethod](`[${level.toUpperCase()}]`, message, context || "", error || "");
      return;
    }

    // In production, use structured JSON logging
    // This can be extended to send to external logging services like Sentry, LogRocket, etc.
    console.log(JSON.stringify(logData));

    // TODO: Send to external logging service in production
    // if (process.env.SENTRY_DSN) {
    //   Sentry.captureMessage(message, { level, extra: context })
    // }
  }

  private formatError(error: Error | unknown): Record<string, unknown> {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    return { error: String(error) };
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.log("debug", message, context);
    }
  }

  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    this.log("error", message, context, error);
    
    // In production, this would send to error tracking service
    // if (process.env.SENTRY_DSN && error instanceof Error) {
    //   Sentry.captureException(error, { extra: context })
    // }
  }
}

// Export singleton instance
export const logger = new LoggerService();

/**
 * Helper to create a logger with a specific context
 * Useful for adding consistent context like module name or user ID
 */
export function createLogger(defaultContext: LogContext): Logger {
  return {
    debug: (message: string, context?: LogContext) =>
      logger.debug(message, { ...defaultContext, ...context }),
    info: (message: string, context?: LogContext) =>
      logger.info(message, { ...defaultContext, ...context }),
    warn: (message: string, context?: LogContext) =>
      logger.warn(message, { ...defaultContext, ...context }),
    error: (message: string, error?: Error | unknown, context?: LogContext) =>
      logger.error(message, error, { ...defaultContext, ...context }),
  };
}
