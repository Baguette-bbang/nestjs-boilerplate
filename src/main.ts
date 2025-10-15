import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './global/filters/http-exception.filter';
import { ResponseInterceptor } from './global/interceptors/response.interceptor';
import { LoggerService } from './common/logger/logger.service';
import { ApiException } from './common/exceptions/api-exception';
import { ERROR_KEYS } from './common/enums/error-codes.enum';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(LoggerService);

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        // 구체적인 검증 에러 메시지 생성
        const errorMessages = errors.map((error) => {
          const constraints = error.constraints;
          if (constraints) {
            return Object.values(constraints).join(', ');
          }
          return `${error.property} 필드 검증에 실패했습니다`;
        });

        const detailedMessage = errorMessages.join('; ');

        return new ApiException(
          ERROR_KEYS.COMMON_VALIDATION_FAILED,
          detailedMessage,
        );
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  // Global interceptor
  app.useGlobalInterceptors(new ResponseInterceptor(logger));

  // CORS configuration
  app.enableCors({
    origin:
      process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()) || [
        'http://localhost:3000',
      ],
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('NestJS Boilerplate API')
    .setDescription('NestJS Boilerplate API 문서')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.info(`🚀 애플리케이션이 포트 ${port}에서 실행 중입니다.`);
  logger.info(`📚 API 문서: http://localhost:${port}/api-docs`);
  logger.info(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((error) => {
  console.error('서버 시작 실패:', error);
  process.exit(1);
});
