import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorCode, ErrorCodeKey } from '../../common/enums/error-codes.enum';
import { ErrorResponse } from '../../common/interfaces/api-response.interface';

/**
 * 에러 아이템 인터페이스
 */
export interface ErrorItem {
  errorCode: ErrorCodeKey;
  customMessage?: string;
}

// 공통 에러 코드들 (모든 엔드포인트에 자동 추가)
const COMMON_ERROR_CODES: ErrorCodeKey[] = [
  'COMMON_INTERNAL_SERVER_ERROR',
  'COMMON_VALIDATION_FAILED',
  'COMMON_BAD_REQUEST',
];

/**
 * API 에러 응답 데코레이터
 * Swagger UI에 에러 응답 스키마를 자동으로 생성
 *
 * @param errors - 에러 코드 배열 (ErrorCodeKey 또는 ErrorItem)
 */
export function ApiErrorResponse(errors: (ErrorCodeKey | ErrorItem)[]) {
  // errors 배열을 정규화
  const normalizedErrors: ErrorItem[] = errors.map((error) => {
    if (typeof error === 'string') {
      return { errorCode: error };
    }
    return error;
  });

  // 공통 에러 코드 추가 (중복 제거)
  const allErrors = [...normalizedErrors];

  COMMON_ERROR_CODES.forEach((commonErrorCode) => {
    const exists = allErrors.some(
      (error) => error.errorCode === commonErrorCode,
    );
    if (!exists) {
      allErrors.push({ errorCode: commonErrorCode });
    }
  });

  // HTTP 상태 코드별로 에러 그룹화
  const errorsByStatus: Record<number, ErrorItem[]> = {};

  allErrors.forEach((errorItem) => {
    const { errorCode } = errorItem;
    const errorInfo = ErrorCode[errorCode];

    if (!errorInfo) {
      throw new Error(
        `에러 코드 '${errorCode}'가 ErrorCode enum에 정의되지 않았습니다.`,
      );
    }

    const status = errorInfo.status;

    if (!errorsByStatus[status]) {
      errorsByStatus[status] = [];
    }
    errorsByStatus[status].push(errorItem);
  });

  // 각 상태 코드별로 ApiResponse 데코레이터 생성
  const decorators = Object.entries(errorsByStatus).map(
    ([statusStr, statusErrors]) => {
      const status = parseInt(statusStr);

      // 각 에러코드별 examples 생성
      const examples: Record<string, any> = {};

      statusErrors.forEach((errorItem) => {
        const { errorCode, customMessage } = errorItem;
        const errorInfo = ErrorCode[errorCode];
        const finalMessage = customMessage || errorInfo.message;

        examples[errorCode] = {
          summary: errorCode,
          description: finalMessage,
          value: {
            success: false,
            statusCode: status,
            error: {
              code: errorInfo.code,
              message: finalMessage,
              details: null,
            },
            timestamp: '2024-07-01T10:30:00.000Z',
            path: '/api/endpoint',
            method: 'GET',
          } as ErrorResponse,
        };
      });

      const allErrorCodes = statusErrors.map(
        (item) => ErrorCode[item.errorCode].code,
      );

      // ErrorResponse 인터페이스 기반 스키마 생성
      const errorResponseSchema = {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
            description: '요청 성공 여부',
          },
          statusCode: {
            type: 'number',
            example: status,
            description: 'HTTP 상태 코드',
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                enum: allErrorCodes,
                example: allErrorCodes[0],
                description: '에러 코드',
              },
              message: {
                type: 'string',
                example:
                  statusErrors[0].customMessage ||
                  ErrorCode[statusErrors[0].errorCode].message,
                description: '에러 메시지',
              },
              details: {
                type: 'object',
                nullable: true,
                example: null,
                description: '추가 에러 상세 정보',
              },
            },
            required: ['code', 'message'],
            description: '에러 정보',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2025-06-01T10:30:00.000Z',
            description: '응답 생성 시간',
          },
          path: {
            type: 'string',
            example: '/api/endpoint',
            description: '요청 경로',
          },
          method: {
            type: 'string',
            enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            example: 'GET',
            description: 'HTTP 메서드',
          },
        },
        required: ['success', 'statusCode', 'error', 'timestamp', 'path', 'method'],
      };

      return ApiResponse({
        status,
        content: {
          'application/json': {
            schema: errorResponseSchema,
            examples,
          },
        },
      });
    },
  );

  return applyDecorators(...decorators);
}
