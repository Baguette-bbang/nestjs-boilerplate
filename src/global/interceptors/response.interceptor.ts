import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { LoggerService } from '../../common/logger/logger.service';
import { SuccessResponse } from '../../common/interfaces/api-response.interface';
import { TraceContext } from '../../common/middleware/trace.middleware';

/**
 * Response Interceptor
 * 컨트롤러 반환값을 표준 성공 응답 형식으로 변환
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  constructor(private readonly logger: LoggerService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const startTime = Date.now();

    // 요청 시작 로그
    const traceId = TraceContext.getTraceId();
    this.logger.info(
      `🚀 REQUEST START [${traceId?.slice(-8)}] ${'─'.repeat(50)}`,
      {},
      'RequestInterceptor',
    );
    this.logger.info(`Method: ${request.method}`, {}, 'RequestInterceptor');
    this.logger.info(`URI: ${request.url}`, {}, 'RequestInterceptor');
    if (request.query && Object.keys(request.query).length > 0) {
      this.logger.info(
        `Query: ${new URLSearchParams(request.query as any).toString()}`,
        {},
        'RequestInterceptor',
      );
    }
    this.logger.info(`Client IP: ${request.ip}`, {}, 'RequestInterceptor');
    this.logger.debug(
      `User-Agent: ${request.get('User-Agent')?.slice(0, 50) || 'Unknown'}...`,
      {},
      'RequestInterceptor',
    );

    return next.handle().pipe(
      map((data): SuccessResponse<T> => {
        const responseTime = Date.now() - startTime;

        // 요청 종료 로그
        this.logger.info(
          `Status: ${response.statusCode}`,
          {
            method: request.method,
            statusCode: response.statusCode,
            responseTime,
          },
          'RequestInterceptor',
        );
        this.logger.info(
          `Response Time: ${responseTime}ms`,
          { responseTime },
          'RequestInterceptor',
        );
        this.logger.info(
          `✅ REQUEST END [${traceId?.slice(-8)}] ${'─'.repeat(50)}`,
          {},
          'RequestInterceptor',
        );

        return {
          success: true,
          statusCode: response.statusCode,
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        };
      }),
    );
  }
}
