import type { PrioritizedTodo } from '../types/bunny';
import type { Todo } from '../types/todo.types';
import { getDaysLeft, getDeadlineLevel } from './deadlineUtils';

function toTime(value?: string): number {
    return value ? new Date(value).getTime() : 0;
}

/**
 * 할 일에 마감 정보를 붙이고 정렬합니다.
 *  - 미완료(active): 마감일이 가까운 순 → 같으면 생성일 순 → 마감일 없는 할 일은 맨 뒤
 *  - 완료(done): 최근에 바뀐 순
 */
export function prioritizeTodos(
    items: Todo[],
    dueDates: Record<string, string>,
    today: Date = new Date(),
): { active: PrioritizedTodo[]; done: PrioritizedTodo[] } {
    const withDeadline: PrioritizedTodo[] = items.map((todo) => {
        const dueDate = dueDates[todo.id];
        const daysLeft = dueDate ? getDaysLeft(dueDate, today) : null;
        return { todo, dueDate, daysLeft, level: getDeadlineLevel(daysLeft) };
    });

    const active = withDeadline
        .filter((p) => p.todo.status !== 'DONE')
        .sort((a, b) => {
            if (a.daysLeft === null && b.daysLeft !== null) return 1;
            if (a.daysLeft !== null && b.daysLeft === null) return -1;
            if (a.daysLeft !== null && b.daysLeft !== null && a.daysLeft !== b.daysLeft) {
                return a.daysLeft - b.daysLeft;
            }
            return toTime(a.todo.createdAt) - toTime(b.todo.createdAt);
        });

    const done = withDeadline
        .filter((p) => p.todo.status === 'DONE')
        .sort(
            (a, b) =>
                toTime(b.todo.updatedAt ?? b.todo.createdAt) -
                toTime(a.todo.updatedAt ?? a.todo.createdAt),
        );

    return { active, done };
}

/** 문자열 → 항상 같은 숫자 (간단한 해시) */
function hashString(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        hash = (hash * 31 + value.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

export interface CardLayout {
    /** 살짝 기울어진 각도 (deg) */
    rotate: number;
    /** 위아래로 어긋난 위치 (px) */
    offsetY: number;
    /** 둥실거리는 타이밍 차이 (s) */
    floatDelay: number;
    /** 구름 모양 종류 */
    cloudVariant: 0 | 1 | 2;
}

/**
 * 카드마다 "조금씩 다른" 위치·구름 모양을 만들어 줍니다.
 * (카드 자체의 크기는 바꾸지 않아요. 확대·축소된 글씨는 흐려 보이기 때문이에요.)
 * 무작위(Math.random)가 아니라 할 일 id로 계산하므로, 다시 그려져도 항상 같은 모양이에요.
 */
export function getCardLayout(id: string): CardLayout {
    const h = hashString(id);
    return {
        rotate: ((h % 7) - 3) * 0.6,
        offsetY: (h >> 3) % 22,
        floatDelay: -((h >> 7) % 60) / 10,
        cloudVariant: ((h >> 9) % 3) as 0 | 1 | 2,
    };
}
