import { HttpException } from '@nestjs/common';
import { ErrorCode, ErrorCodeKey } from '../enums/error-codes.enum';

/**
 * ApiException 사용법:
 *
 * // 1. 기본 사용
 * throw new ApiException('USER_NOT_FOUND');
 *
 * // 2. 커스텀 메시지
 * throw new ApiException('USER_NOT_FOUND', '해당 ID의 사용자를 찾을 수 없습니다');
 *
 * // 3. 옵션 객체 (메시지 + 상세정보)
 * throw new ApiException('USER_NOT_FOUND', {
 *   message: '해당 ID의 사용자를 찾을 수 없습니다',
 *   details: { userId: '123' }
 * });
 */

/**
 * ApiException 옵션 인터페이스
 */
export interface ApiExceptionOptions {
  message?: string; // 커스텀 메시지
  details?: unknown; // 추가 상세 정보
}

/**
 * 커스텀 API 예외 클래스
 * 표준화된 에러 응답을 생성하기 위한 클래스
 */
export class ApiException extends HttpException {
  public readonly errorKey: ErrorCodeKey;
  public readonly errorCode: string;
  public readonly customMessage?: string;
  public readonly details?: unknown;

  constructor(errorKey: ErrorCodeKey, options?: string | ApiExceptionOptions) {
    const errorInfo = ErrorCode[errorKey];

    let finalOptions: ApiExceptionOptions = {};

    if (typeof options === 'string') {
      // 문자열이면 커스텀 메시지로 처리
      finalOptions = { message: options };
    } else if (options && typeof options === 'object') {
      // ApiExceptionOptions 객체 처리
      finalOptions = options;
    }

    const finalMessage = finalOptions.message || errorInfo.message;

    // HttpException에는 메시지와 상태코드만 전달
    super(finalMessage, errorInfo.status);

    this.errorKey = errorKey;
    this.errorCode = errorInfo.code;
    this.customMessage = finalOptions.message;
    this.details = finalOptions.details;
  }

  /**
   * 디버깅 정보 반환
   */
  toDebugInfo() {
    return {
      errorKey: this.errorKey,
      errorCode: this.errorCode,
      message: this.message,
      customMessage: this.customMessage,
      details: this.details,
      status: this.getStatus(),
    };
  }

  /**
   * 원본 ErrorCode 정보 반환
   */
  getErrorInfo() {
    return ErrorCode[this.errorKey];
  }
}
