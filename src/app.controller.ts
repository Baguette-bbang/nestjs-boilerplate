import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiSuccessResponse, ApiErrorResponse } from './global/decorators';

/**
 * 샘플 응답 DTO
 */
export class HelloResponseDto {
  message: string;
}

@ApiTags('기본')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Hello World',
    description: '기본 헬스체크 엔드포인트',
  })
  @ApiSuccessResponse(HelloResponseDto, 'Hello World 메시지 반환')
  @ApiErrorResponse(['COMMON_INTERNAL_SERVER_ERROR'])
  getHello(): HelloResponseDto {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: '헬스체크', description: '서버 상태 확인' })
  @ApiSuccessResponse(HelloResponseDto, '서버 상태 반환')
  @ApiErrorResponse(['COMMON_INTERNAL_SERVER_ERROR'])
  getHealth(): HelloResponseDto {
    return { message: 'OK' };
  }
}
