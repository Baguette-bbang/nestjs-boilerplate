import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';

/**
 * API 성공 응답 데코레이터
 * Swagger UI에 성공 응답 스키마를 자동으로 생성
 *
 * @param dataType - 응답 데이터 타입 (단일 타입 또는 배열)
 * @param description - 응답 설명
 * @param usePagination - 페이지네이션 사용 여부
 */
export function ApiSuccessResponse<T>(
  dataType: Type<T> | Type<T>[],
  description?: string,
  usePagination?: boolean,
) {
  const isArray = Array.isArray(dataType);
  const actualDataType = isArray ? dataType[0] : dataType;

  const baseSchema = {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      statusCode: { type: 'number', example: 200 },
      data: usePagination
        ? {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(actualDataType) },
              },
              pagination: {
                type: 'object',
                properties: {
                  limit: { type: 'number', example: 10 },
                  currentPage: { type: 'number', example: 1 },
                  totalPage: { type: 'number', example: 15 },
                  totalCount: { type: 'number', example: 150 },
                },
                required: ['limit', 'currentPage', 'totalPage', 'totalCount'],
              },
            },
            required: ['items', 'pagination'],
          }
        : isArray
          ? { type: 'array', items: { $ref: getSchemaPath(actualDataType) } }
          : { $ref: getSchemaPath(actualDataType) },
      timestamp: { type: 'string', format: 'date-time' },
      path: { type: 'string' },
      method: { type: 'string' },
    },
    required: ['success', 'statusCode', 'data', 'timestamp', 'path', 'method'],
  };

  return applyDecorators(
    ApiOkResponse({
      description: description || '요청이 성공적으로 처리되었습니다',
      schema: baseSchema,
    }),
    ApiExtraModels(actualDataType),
  );
}
