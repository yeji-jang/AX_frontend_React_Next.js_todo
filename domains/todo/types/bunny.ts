import type { Todo } from './todo.types';

/**
 * 토끼 배달원의 상태
 * 우선순위: celebrating > delivering > urgent > talking > sleeping > idle
 * (단, 배달 중에는 배달이 끝날 때까지 다른 상태로 바뀌지 않아요.)
 */
export type BunnyMode =
    | 'idle' // 기본 대기
    | 'delivering' // 할 일 배달 중
    | 'urgent' // 마감 임박 알림 (신문 뿌리기)
    | 'talking' // 사용자에게 말 걸기
    | 'sleeping' // 집 안 침대에서 휴식
    | 'celebrating'; // 할 일 완료 축하

/** 토끼 표정 */
export type BunnyExpression = 'happy' | 'calm' | 'worried' | 'excited' | 'sleeping';

/** 토끼가 들고 있는 물건 */
export type BunnyHolding = 'none' | 'letter' | 'newspaper';

/** 배달 단계: 우체통에서 등장 → 통통 이동 → 편지를 구름으로 던지기 */
export type DeliveryStep = 'emerge' | 'hop' | 'toss';

/** 배달할 택배(새로 등록된 할 일) */
export interface Parcel {
    id: string;
    title: string;
    dueDate?: string;
}

/** 완료 축하 이벤트 */
export interface Celebration {
    id: string;
    title: string;
    /** 같은 할 일을 다시 완료해도 새 이벤트로 구분하기 위한 값 */
    key: number;
}

/** 토끼의 말 */
export interface BunnyTalk {
    text: string;
    key: number;
}

/**
 * 마감까지 남은 날짜에 따른 단계
 *   overdue: 마감 지남 / today: 오늘 마감 / urgent: 1~3일
 *   normal: 4~9일 / rest: 정확히 10일 / relaxed: 11일 이상 / none: 마감일 없음
 */
export type DeadlineLevel =
    | 'none'
    | 'overdue'
    | 'today'
    | 'urgent'
    | 'normal'
    | 'rest'
    | 'relaxed';

/** 마감 정보가 붙은 할 일 */
export interface PrioritizedTodo {
    todo: Todo;
    dueDate?: string;
    /** 마감일이 없으면 null */
    daysLeft: number | null;
    level: DeadlineLevel;
}

/** 시간대 (배경 분위기) */
export type DayPeriod = 'morning' | 'day' | 'evening' | 'night';
