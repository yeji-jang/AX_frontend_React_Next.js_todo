'use client';

import { AnimatePresence } from 'motion/react';
import type { PrioritizedTodo } from '../types/bunny';
import type { TodoStatus } from '../types/todo.types';
import TodoItem from './TodoItem';

interface TodoItemsProps {
    /** 마감 가까운 순으로 정렬된 할 일 */
    entries: PrioritizedTodo[];
    /** 아직 토끼가 배달 중인 할 일 (배달이 끝나야 구름 위에 나타나요) */
    hiddenIds: string[];
    emptyMessage: string;
    onChangeStatus: (id: string, status: TodoStatus) => void;
    onComplete: (id: string, title: string) => void;
}

// 구름 위 할 일 카드 목록
export default function TodoItems({
    entries,
    hiddenIds,
    emptyMessage,
    onChangeStatus,
    onComplete,
}: TodoItemsProps) {
    const visible = entries.filter((entry) => !hiddenIds.includes(entry.todo.id));

    if (visible.length === 0) {
        return (
            <div className="mx-auto my-6 max-w-sm text-center">
                <div className="empty-cloud">
                    <p className="font-cute text-lg text-[#65564B]">☁️ {emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <ul className="grid grid-cols-1 gap-x-6 gap-y-10 pt-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* popLayout: 카드가 사라질 때 다른 카드들이 바로 자리를 채우며 부드럽게 이동해요. */}
            <AnimatePresence mode="popLayout">
                {visible.map((entry) => (
                    <TodoItem
                        key={entry.todo.id}
                        entry={entry}
                        onChangeStatus={onChangeStatus}
                        onComplete={onComplete}
                    />
                ))}
            </AnimatePresence>
        </ul>
    );
}
