# NestJS Boilerplate

프로덕션 레벨의 NestJS 백엔드 보일러플레이트입니다. 표준화된 API 응답 구조, 고급 로깅 시스템, Swagger 문서화 등을 포함합니다.

## 주요 기능

### 1. 표준화된 API 응답 구조
- ✅ 통일된 성공/에러 응답 형식
- ✅ Response Interceptor를 통한 자동 응답 래핑
- ✅ 상세한 에러 코드 시스템

### 2. 고급 로깅 시스템
- ✅ Winston 기반 구조화된 로깅
- ✅ 일일 로그 로테이션 및 자동 압축
- ✅ 개발/프로덕션 환경별 로그 포맷
- ✅ Trace ID를 통한 요청 추적
- ✅ 민감정보 자동 마스킹 (프로덕션)

### 3. Global Exception Filter
- ✅ 모든 예외의 일관된 처리
- ✅ ApiException 커스텀 예외 시스템
- ✅ ValidationPipe 에러 통합 처리
- ✅ 상세한 에러 로깅

### 4. Swagger API 문서화
- ✅ 자동 API 문서 생성
- ✅ 성공/에러 응답 데코레이터
- ✅ DTO 기반 스키마 생성
- ✅ 실시간 API 테스트

## API 테스트

서버 실행 후 다음 엔드포인트에서 테스트 가능합니다:
- http://localhost:3000/api - Hello World
- http://localhost:3000/api/health - 헬스체크
- http://localhost:3000/api-docs - Swagger 문서

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env

# 개발 모드 실행
npm run start:dev

# 프로덕션 빌드
npm run build
npm run start:prod
```

## 사용 예제

### 커스텀 Exception
```typescript
import { ApiException } from './common/exceptions/api-exception';

throw new ApiException('USER_NOT_FOUND', {
  message: '해당 ID의 사용자를 찾을 수 없습니다',
  details: { userId: '123' }
});
```

### Swagger 데코레이터
```typescript
import { ApiSuccessResponse, ApiErrorResponse } from './global/decorators';

@Get()
@ApiSuccessResponse(HelloResponseDto, 'Hello World 메시지 반환')
@ApiErrorResponse(['USER_NOT_FOUND', 'COMMON_INTERNAL_SERVER_ERROR'])
getHello(): HelloResponseDto {
  return this.appService.getHello();
}
```

## 라이선스

UNLICENSED
