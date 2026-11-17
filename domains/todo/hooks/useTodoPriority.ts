'use client';

import { useMemo } from 'react';
import { useDueDateStore } from '../stores/useDueDateStore';
import type { PrioritizedTodo } from '../types/bunny';
import type { Todo } from '../types/todo.types';
import { isUrgentLevel } from '../utils/deadlineUtils';
import { prioritizeTodos } from '../utils/todoPriority';

export interface TodoPriority {
    /** 브라우저에 저장된 마감일을 다 읽었는지 */
    hydrated: boolean;
    /** 미완료 (마감 가까운 순) */
    active: PrioritizedTodo[];
    /** 완료 */
    done: PrioritizedTodo[];
    /** 긴급 (마감 지남 · 오늘 · 1~3일) */
    urgent: PrioritizedTodo[];
    /** 정확히 10일 남은 할 일 */
    resting: PrioritizedTodo[];
    /** 오늘까지 해야 하는 할 일 (오늘 마감 + 마감 지남) */
    today: PrioritizedTodo[];
}

// 할 일 목록에 마감 정보를 붙이고, 화면과 토끼가 쓰는 묶음으로 나눠 주는 훅
export function useTodoPriority(items: Todo[]): TodoPriority {
    const hydrated = useDueDateStore((state) => state._hasHydrated);
    const dueDates = useDueDateStore((state) => state.dueDates);

    return useMemo(() => {
        // 하이드레이션 전에는 서버 화면과 똑같이 그리기 위해 마감일 없이 계산합니다.
        const { active, done } = prioritizeTodos(items, hydrated ? dueDates : {});
        return {
            hydrated,
            active,
            done,
            urgent: active.filter((p) => isUrgentLevel(p.level)),
            resting: active.filter((p) => p.level === 'rest'),
            today: active.filter((p) => p.level === 'today' || p.level === 'overdue'),
        };
    }, [items, dueDates, hydrated]);
}
