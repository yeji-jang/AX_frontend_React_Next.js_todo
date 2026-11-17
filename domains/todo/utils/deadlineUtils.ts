import type { DeadlineLevel } from '../types/bunny';

/** 마감 3일 이내(오늘 포함)는 긴급 */
export const URGENT_DAYS = 3;
/** 정확히 10일 남으면 토끼가 휴식 */
export const REST_DAYS = 10;

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 'YYYY-MM-DD' 형식인지 확인 */
export function isValidDueDate(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** 오늘(사용자 기기 날짜)부터 마감일까지 남은 날짜 수. 오늘 마감 = 0, 지났으면 음수 */
export function getDaysLeft(dueDate: string, today: Date = new Date()): number {
    const [y, m, d] = dueDate.split('-').map(Number);
    const due = Date.UTC(y, m - 1, d);
    const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    return Math.round((due - now) / 86_400_000);
}

export function getDeadlineLevel(daysLeft: number | null): DeadlineLevel {
    if (daysLeft === null) return 'none';
    if (daysLeft < 0) return 'overdue';
    if (daysLeft === 0) return 'today';
    if (daysLeft <= URGENT_DAYS) return 'urgent';
    if (daysLeft < REST_DAYS) return 'normal';
    if (daysLeft === REST_DAYS) return 'rest';
    return 'relaxed';
}

/** 긴급 강조 대상인지 (마감 지남 / 오늘 / 1~3일) */
export function isUrgentLevel(level: DeadlineLevel): boolean {
    return level === 'overdue' || level === 'today' || level === 'urgent';
}

/** 3 → 'D-3', 0 → 'D-DAY', -2 → 'D+2' */
export function formatDday(daysLeft: number): string {
    if (daysLeft === 0) return 'D-DAY';
    return daysLeft > 0 ? `D-${daysLeft}` : `D+${-daysLeft}`;
}

/** '2026-11-20' → '11월 20일 (금)' */
export function formatDueDate(dueDate: string): string {
    const [y, m, d] = dueDate.split('-').map(Number);
    const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()];
    return `${m}월 ${d}일 (${weekday})`;
}

/** 신문/알림에 쓸 문구 */
export function getUrgentHeadline(daysLeft: number): string {
    if (daysLeft < 0) return `마감이 ${-daysLeft}일 지났어요!`;
    if (daysLeft === 0) return '오늘 마감이에요!';
    return `${daysLeft}일 남았어요!`;
}
