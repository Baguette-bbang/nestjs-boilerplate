import { HttpStatus } from '@nestjs/common';

/**
 * 에러 코드 정의
 * 각 에러 코드는 고유한 코드, 메시지, HTTP 상태 코드를 가집니다.
 */
export const ErrorCode = {
  // ====================================
  // Common Errors (COM-xxx)
  // ====================================
  COMMON_INTERNAL_SERVER_ERROR: {
    code: 'COM-001',
    message: '서버 내부 오류가 발생했습니다',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  COMMON_VALIDATION_FAILED: {
    code: 'COM-002',
    message: '입력 데이터 검증에 실패했습니다',
    status: HttpStatus.BAD_REQUEST,
  },
  COMMON_BAD_REQUEST: {
    code: 'COM-003',
    message: '잘못된 요청입니다',
    status: HttpStatus.BAD_REQUEST,
  },
  COMMON_UNAUTHORIZED: {
    code: 'COM-004',
    message: '인증이 필요합니다',
    status: HttpStatus.UNAUTHORIZED,
  },
  COMMON_FORBIDDEN: {
    code: 'COM-005',
    message: '접근 권한이 없습니다',
    status: HttpStatus.FORBIDDEN,
  },
  COMMON_NOT_FOUND: {
    code: 'COM-006',
    message: '요청한 리소스를 찾을 수 없습니다',
    status: HttpStatus.NOT_FOUND,
  },
  COMMON_CONFLICT: {
    code: 'COM-007',
    message: '리소스 충돌이 발생했습니다',
    status: HttpStatus.CONFLICT,
  },
  COMMON_DATABASE_ERROR: {
    code: 'COM-008',
    message: '데이터베이스 오류가 발생했습니다',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  COMMON_TIMEOUT: {
    code: 'COM-009',
    message: '요청 시간이 초과되었습니다',
    status: HttpStatus.REQUEST_TIMEOUT,
  },
  COMMON_TOO_MANY_REQUESTS: {
    code: 'COM-010',
    message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요',
    status: HttpStatus.TOO_MANY_REQUESTS,
  },

  // ====================================
  // User Errors (USR-xxx)
  // ====================================
  USER_NOT_FOUND: {
    code: 'USR-001',
    message: '사용자를 찾을 수 없습니다',
    status: HttpStatus.NOT_FOUND,
  },
  USER_ALREADY_EXISTS: {
    code: 'USR-002',
    message: '이미 존재하는 사용자입니다',
    status: HttpStatus.CONFLICT,
  },
  USER_INVALID_CREDENTIALS: {
    code: 'USR-003',
    message: '잘못된 인증 정보입니다',
    status: HttpStatus.UNAUTHORIZED,
  },
  USER_INACTIVE: {
    code: 'USR-004',
    message: '비활성화된 사용자입니다',
    status: HttpStatus.FORBIDDEN,
  },
  USER_DELETED: {
    code: 'USR-005',
    message: '삭제된 사용자입니다',
    status: HttpStatus.FORBIDDEN,
  },

  // ====================================
  // Auth Errors (AUTH-xxx)
  // ====================================
  AUTH_TOKEN_INVALID: {
    code: 'AUTH-001',
    message: '유효하지 않은 토큰입니다',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_TOKEN_EXPIRED: {
    code: 'AUTH-002',
    message: '만료된 토큰입니다',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_TOKEN_NOT_PROVIDED: {
    code: 'AUTH-003',
    message: '토큰이 제공되지 않았습니다',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_REFRESH_TOKEN_INVALID: {
    code: 'AUTH-004',
    message: '유효하지 않은 리프레시 토큰입니다',
    status: HttpStatus.UNAUTHORIZED,
  },
  AUTH_INSUFFICIENT_PERMISSIONS: {
    code: 'AUTH-005',
    message: '권한이 부족합니다',
    status: HttpStatus.FORBIDDEN,
  },
} as const;

/**
 * 에러 코드 키 타입
 */
export type ErrorCodeKey = keyof typeof ErrorCode;

/**
 * 에러 코드만 추출한 객체
 */
export const ERROR_KEYS: Record<ErrorCodeKey, ErrorCodeKey> = Object.keys(
  ErrorCode,
).reduce(
  (acc, key) => {
    acc[key as ErrorCodeKey] = key as ErrorCodeKey;
    return acc;
  },
  {} as Record<ErrorCodeKey, ErrorCodeKey>,
);
