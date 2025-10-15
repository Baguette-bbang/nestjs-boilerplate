import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');
import * as path from 'path';
import * as fs from 'fs';
import { TraceContext } from '../middleware/trace.middleware';
import { LogFormatterService } from './log-formatter.service';

/**
 * 커스텀 로거 서비스
 * Winston을 활용한 고급 로깅 시스템
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private isDevelopment =
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'staging';
  private isProduction = process.env.NODE_ENV === 'production';

  constructor() {
    this.initializeLogger();
  }

  private initializeLogger(): void {
    const levels = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4,
    };

    const colors = {
      error: 'red',
      warn: 'yellow',
      info: 'green',
      http: 'magenta',
      debug: 'white',
    };

    winston.addColors(colors);

    // 개발 환경: 고급 색상 및 아이콘 포맷
    const developmentConsoleFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf((info) => {
        return LogFormatterService.formatDevelopment(info);
      }),
    );

    // 프로덕션 환경: 간결한 색상 포맷
    const productionConsoleFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf((info) => {
        return LogFormatterService.formatProduction(info);
      }),
    );

    // 파일 저장용 포맷 (JSON)
    const fileFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.printf((info) => {
        const traceId = TraceContext.getTraceId() || 'no-trace';
        const threadId = `node-${process.pid}`;
        const loggerName = info.context || 'System';

        // JSON 형태로 구조화된 로그 생성
        const logData: Record<string, any> = {
          timestamp: info.timestamp,
          thread: threadId,
          level: info.level.toUpperCase(),
          traceId: traceId,
          logger: loggerName,
          message: info.message,
        };

        // 조건부 필드 추가
        if (info.stack) logData.stack = info.stack;
        if (info.method) logData.method = info.method;
        if (info.statusCode) logData.statusCode = info.statusCode;
        if (info.responseTime) logData.responseTime = `${info.responseTime}ms`;

        // 추가 메타 필드 포함
        const baseKeys = new Set([
          'timestamp',
          'level',
          'message',
          'stack',
          'method',
          'statusCode',
          'responseTime',
          'context',
        ]);
        for (const [key, value] of Object.entries(info)) {
          if (!baseKeys.has(key) && value !== undefined) {
            (logData as any)[key] = value;
          }
        }

        // 프로덕션에서는 스택 트레이스 제거
        if (this.isProduction) {
          const { stack: _stack, ...sanitized } = logData;
          return JSON.stringify(sanitized);
        }

        return JSON.stringify(logData);
      }),
    );

    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || (this.isDevelopment ? 'debug' : 'info'),
      levels,
      format: fileFormat,
      transports: [
        new DailyRotateFile({
          filename: path.join(logDir, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '10m',
          maxFiles: '14d',
          zippedArchive: true,
        }),
        new DailyRotateFile({
          filename: path.join(logDir, 'combined-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          zippedArchive: true,
        }),
      ],
    });

    // 환경별 콘솔 출력 설정
    if (this.isDevelopment || this.isProduction) {
      this.logger.add(
        new winston.transports.Console({
          format: this.isDevelopment
            ? developmentConsoleFormat
            : productionConsoleFormat,
          handleExceptions: true,
          handleRejections: true,
        }),
      );
    }
  }

  log(message: string, context?: any, loggerName?: string): void {
    const logData = {
      message,
      context: loggerName || context?.context || 'Application',
      ...(context && this.sanitizeContext(context)),
    };
    this.logger.info(logData);
  }

  error(
    message: string,
    trace?: string,
    context?: any,
    loggerName?: string,
  ): void {
    const logData: any = {
      message,
      context: loggerName || context?.context || 'Application',
    };
    if (trace) logData.stack = trace;
    if (context) Object.assign(logData, this.sanitizeContext(context));

    this.logger.error(logData);
  }

  warn(message: string, context?: any, loggerName?: string): void {
    const logData = {
      message,
      context: loggerName || context?.context || 'Application',
      ...(context && this.sanitizeContext(context)),
    };
    this.logger.warn(logData);
  }

  debug(message: string, context?: any, loggerName?: string): void {
    const logData = {
      message,
      context: loggerName || context?.context || 'Application',
      ...(context && this.sanitizeContext(context)),
    };
    this.logger.debug(logData);
  }

  verbose(message: string, context?: any, loggerName?: string): void {
    const logData = {
      message,
      context: loggerName || context?.context || 'Application',
      ...(context && this.sanitizeContext(context)),
    };
    this.logger.verbose(logData);
  }

  /**
   * 민감한 정보 제거/마스킹
   */
  private sanitizeContext(context: any): any {
    if (!context || typeof context !== 'object') return context;

    const sanitized = { ...context };

    // 프로덕션에서 민감한 정보 마스킹
    if (this.isProduction) {
      // IP 주소 마스킹
      if (sanitized.ip && sanitized.ip !== '::1' && sanitized.ip !== '127.0.0.1') {
        const parts = sanitized.ip.split('.');
        if (parts.length === 4) {
          sanitized.ip = `${parts[0]}.${parts[1]}.*.***`;
        }
      }

      // User-Agent 단순화
      if (sanitized.userAgent) {
        const ua = sanitized.userAgent;
        if (ua.includes('Chrome')) sanitized.userAgent = 'Chrome Browser';
        else if (ua.includes('Firefox'))
          sanitized.userAgent = 'Firefox Browser';
        else if (ua.includes('Safari'))
          sanitized.userAgent = 'Safari Browser';
        else sanitized.userAgent = 'Unknown Browser';
      }

      // 스택 트레이스 제거
      delete sanitized.stack;
    }

    return sanitized;
  }

  info = this.log;
}
