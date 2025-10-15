import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../../common/logger/logger.service';
import { ApiException } from '../../common/exceptions/api-exception';
import { ErrorResponse } from '../../common/interfaces/api-response.interface';
import { ERROR_KEYS } from '../../common/enums/error-codes.enum';

/**
 * Global Exception Filter
 * 모든 예외를 잡아서 일관된 에러 응답 형식으로 변환
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let errorResponse: ErrorResponse;

    if (exception instanceof ApiException) {
      // ApiException 처리
      status = exception.getStatus();
      errorResponse = {
        success: false,
        statusCode: status,
        error: {
          code: exception.errorCode,
          message: exception.message,
          details: exception.details || null,
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      };

      // ApiException 전용 로깅
      this.logger.error('ApiException occurred', exception.stack, {
        errorKey: exception.errorKey,
        errorCode: exception.errorCode,
        customMessage: exception.customMessage,
        details: exception.details,
        statusCode: status,
        method: request.method,
        path: request.url,
        userAgent: request.get('User-Agent'),
        ip: request.ip,
      });
    } else if (exception instanceof HttpException) {
      // 일반 HttpException 처리
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let message: string;
      let details: any = null;

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        // ValidationPipe 에러나 구조화된 응답
        message = (exceptionResponse as any).message || exception.message;
        details = exceptionResponse;
      } else {
        // 단순 문자열 메시지
        message =
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : exception.message;
      }

      errorResponse = {
        success: false,
        statusCode: status,
        error: {
          code: `HTTP-${status}`,
          message,
          details,
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      };

      // HttpException 로깅
      this.logger.error('HttpException occurred', exception.stack, {
        statusCode: status,
        message,
        method: request.method,
        path: request.url,
        userAgent: request.get('User-Agent'),
        ip: request.ip,
        exceptionType: exception.constructor.name,
      });
    } else {
      // 예상치 못한 에러
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      const errorMessage =
        exception instanceof Error ? exception.message : 'Unknown error';

      errorResponse = {
        success: false,
        statusCode: status,
        error: {
          code: ERROR_KEYS.COMMON_INTERNAL_SERVER_ERROR,
          message: '서버 내부 오류가 발생했습니다',
          details:
            process.env.NODE_ENV === 'development'
              ? {
                  originalError: errorMessage,
                }
              : null,
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      };

      // 시스템 에러 로깅
      this.logger.error(
        'Unexpected error occurred',
        exception instanceof Error ? exception.stack : undefined,
        {
          statusCode: status,
          originalMessage: errorMessage,
          method: request.method,
          path: request.url,
          userAgent: request.get('User-Agent'),
          ip: request.ip,
          errorType: exception?.constructor?.name || 'Unknown',
          // 개발 환경에서만 전체 에러 객체 포함
          ...(process.env.NODE_ENV === 'development' && {
            fullError: exception,
          }),
        },
      );
    }

    response.status(status).json(errorResponse);
  }
}
