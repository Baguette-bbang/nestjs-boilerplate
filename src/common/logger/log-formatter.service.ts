import * as util from 'util';
import { TraceContext } from '../middleware/trace.middleware';

/**
 * 로그 포맷팅 서비스
 * 개발/프로덕션 환경에 맞는 로그 포맷 제공
 */
export class LogFormatterService {
  /**
   * 개발 환경용 상세 포맷
   */
  static formatDevelopment(info: any): string {
    const { timestamp, level, message, context, stack, ...meta } = info;
    const traceId = TraceContext.getTraceId() || 'no-trace';
    const threadId = `node-${process.pid}`;

    // 레벨별 아이콘
    const levelIcons: Record<string, string> = {
      error: '❌',
      warn: '⚠️',
      info: '✅',
      http: '🌐',
      debug: '🔍',
    };

    const icon = levelIcons[level] || '📝';
    const loggerName = context || 'System';

    // 메타데이터 포맷팅
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = '\n' + util.inspect(meta, { colors: true, depth: 3 });
    }

    // 스택 트레이스 포맷팅
    let stackStr = '';
    if (stack) {
      stackStr = '\n' + stack;
    }

    return `${timestamp} ${icon} [${level.toUpperCase()}] [${threadId}] [${traceId.slice(-8)}] [${loggerName}] - ${message}${metaStr}${stackStr}`;
  }

  /**
   * 프로덕션 환경용 간결 포맷
   */
  static formatProduction(info: any): string {
    const { timestamp, level, message, context, stack, ...meta } = info;
    const traceId = TraceContext.getTraceId() || 'no-trace';
    const loggerName = context || 'System';

    // 간결한 메타데이터 (한 줄)
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = ' ' + JSON.stringify(meta);
    }

    return `${timestamp} [${level.toUpperCase()}] [${traceId.slice(-8)}] [${loggerName}] ${message}${metaStr}`;
  }
}
