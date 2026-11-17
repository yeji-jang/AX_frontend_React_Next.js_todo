'use client';
// 마감일은 브라우저 저장소에 있어서, 서버 컴포넌트(TodoDetail) 안에 넣는 작은 클라이언트 컴포넌트입니다.

import { useDueDateStore } from '../stores/useDueDateStore';
import { formatDday, formatDueDate, getDaysLeft, getDeadlineLevel, isUrgentLevel } from '../utils/deadlineUtils';

export default function DueDateBadge({ id }: { id: string }) {
    const hydrated = useDueDateStore((state) => state._hasHydrated);
    const dueDate = useDueDateStore((state) => state.dueDates[id]);

    if (!hydrated) return <dd>…</dd>;
    if (!dueDate) return <dd>마감일 없음</dd>;

    const daysLeft = getDaysLeft(dueDate);
    const urgent = isUrgentLevel(getDeadlineLevel(daysLeft));

    return (
        <dd className="flex items-center gap-2">
            {formatDueDate(dueDate)}
            <span className="dday-chip" data-tone={urgent ? 'urgent' : 'default'}>
                {formatDday(daysLeft)}
            </span>
        </dd>
    );
}
