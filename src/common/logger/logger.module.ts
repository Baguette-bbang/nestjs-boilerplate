import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

/**
 * 로거 모듈
 * @Global 데코레이터로 전역 사용 가능
 */
@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
