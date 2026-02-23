type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Simple logger that writes to stderr (doesn't interfere with stdio transport)
 */
export class Logger {
  constructor(private level: LogLevel = 'info') {}

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private log(level: LogLevel, message: string, data?: unknown) {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data ? { data } : {}),
    };

    console.error(JSON.stringify(logEntry));
  }

  debug(message: string, data?: unknown) {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown) {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown) {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown) {
    this.log('error', message, data);
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger((process.env.LOG_LEVEL as LogLevel) ?? 'info');
