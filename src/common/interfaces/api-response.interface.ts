/**
 * API 응답 공통 인터페이스
 * 모든 API 응답의 표준 형식을 정의합니다.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  path: string;
  method: string;
}

/**
 * 성공 응답 인터페이스
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  statusCode: number;
  data: T;
  timestamp: string;
  path: string;
  method: string;
}

/**
 * 에러 응답 인터페이스
 */
export interface ErrorResponse {
  success: false;
  statusCode: number;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  path: string;
  method: string;
}
