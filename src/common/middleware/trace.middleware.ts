import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * Trace Context 저장소
 * 비동기 작업 간 컨텍스트를 공유하기 위한 AsyncLocalStorage 활용
 */
export class TraceContext {
  private static storage = new AsyncLocalStorage<Map<string, any>>();

  static run<T>(callback: () => T): T {
    return this.storage.run(new Map(), callback);
  }

  static set(key: string, value: any): void {
    const store = this.storage.getStore();
    if (store) {
      store.set(key, value);
    }
  }

  static get<T>(key: string): T | undefined {
    const store = this.storage.getStore();
    return store?.get(key);
  }

  static getTraceId(): string | undefined {
    return this.get<string>('traceId');
  }

  static setTraceId(traceId: string): void {
    this.set('traceId', traceId);
  }
}

/**
 * Trace Middleware
 * 모든 요청에 고유한 traceId를 부여하고 컨텍스트에 저장
 */
@Injectable()
export class TraceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    TraceContext.run(() => {
      // 요청 헤더에서 traceId를 가져오거나 새로 생성
      const traceId =
        (req.headers['x-trace-id'] as string) ||
        `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      TraceContext.setTraceId(traceId);

      // 응답 헤더에 traceId 추가
      res.setHeader('x-trace-id', traceId);

      next();
    });
  }
}
