'use client';

import { AnimatePresence, motion, useIsPresent } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';
import { DEFAULT_PAPER } from '@/domains/shop/constants/shopCatalog';
import { useShopStore } from '@/domains/shop/stores/useShopStore';
import { cn } from '@/shared/utils/cn';
import { TODO_STATUS_MAP } from '../constants/todoStatus';
import { useBunnyStore } from '../stores/useBunnyStore';
import { usePinStore } from '../stores/usePinStore';
import type { PrioritizedTodo } from '../types/bunny';
import type { TodoStatus } from '../types/todo.types';
import { formatDday, formatDueDate, isUrgentLevel } from '../utils/deadlineUtils';
import { getCardLayout } from '../utils/todoPriority';
import { cardLayoutId } from './bunny/BunnyDeliveryAnimation';
import DeleteTodoButton from './DeleteTodoButton';
import TodoCloud from './TodoCloud';
import TodoContentViewer from './TodoContentViewer';

interface TodoItemProps {
    entry: PrioritizedTodo;
    onChangeStatus: (id: string, status: TodoStatus) => void;
    onComplete: (id: string, title: string) => void;
}

/** 카드 색: 긴급 → 코랄, 정확히 10일 → 파스텔 블루, 그 외 → 크림 */
function getTone(entry: PrioritizedTodo): 'urgent' | 'rest' | 'default' {
    if (isUrgentLevel(entry.level)) return 'urgent';
    if (entry.level === 'rest') return 'rest';
    return 'default';
}

function getDdayLabel({ daysLeft, level }: PrioritizedTodo): string | null {
    if (daysLeft === null) return null;
    if (level === 'overdue') return `🚨 ${formatDday(daysLeft)}`;
    if (level === 'today' || level === 'urgent') return `🚨 ${formatDday(daysLeft)}`;
    if (level === 'rest') return `😴 ${formatDday(daysLeft)}`;
    return formatDday(daysLeft);
}

// 구름 위에 놓인 할 일 메모 카드 하나
export default function TodoItem({ entry, onChangeStatus, onComplete }: TodoItemProps) {
    const { todo, dueDate } = entry;
    const { id, title, status, content } = todo;

    const layout = getCardLayout(id);
    const tone = getTone(entry);
    const ddayLabel = getDdayLabel(entry);

    const [expanded, setExpanded] = useState(false);

    // 완료되어 사라지는 중이면 별이 반짝여요.
    const isPresent = useIsPresent();
    const completing = useBunnyStore((state) => state.celebration?.id === id);

    const pinHydrated = usePinStore((state) => state._hasHydrated);
    const isPinned = usePinStore((state) => state.items.some((item) => item.id === id));
    const addPin = usePinStore((state) => state.add);
    const removePin = usePinStore((state) => state.remove);

    // 잡화점에서 고른 편지지 무늬
    const paper = useShopStore((state) => (state._hasHydrated ? state.equippedPaper : DEFAULT_PAPER));

    const nextStatus: TodoStatus = status === 'READY' ? 'PROGRESS' : 'READY';

    return (
        <motion.li
            // 배달 편지와 같은 layoutId → 편지가 날아와 이 카드가 돼요.
            layoutId={cardLayoutId(id)}
            layout
            className={cn('relative list-none', expanded && 'sm:col-span-2')}
            style={{ marginTop: layout.offsetY, borderRadius: 22 }}
            initial={{ opacity: 0, scale: 0.8, y: 18 }}
            // 글씨가 흐려지지 않도록 카드는 항상 원래 크기(1배)로 둬요.
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
                opacity: 0,
                y: -80,
                scale: 0.75,
                transition: { duration: 0.75, ease: [0.4, 0, 0.6, 1] },
            }}
            whileHover={{ y: -4 }}
            // 낮은 damping → 통통 튀며 자리를 잡아요.
            transition={{ type: 'spring', stiffness: 210, damping: 15 }}
        >
            <div className="relative">
                {/* 기울기와 둥실거림은 구름 받침에만 줘요. (카드 글씨는 반듯하고 선명하게) */}
                <TodoCloud
                    variant={layout.cloudVariant}
                    rotate={layout.rotate}
                    floatDelay={layout.floatDelay}
                />

                <article className="memo-card" data-tone={tone} data-paper={paper}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                            {ddayLabel && (
                                <span className="dday-chip" data-tone={tone}>
                                    {ddayLabel}
                                </span>
                            )}
                            <span className="status-chip" data-status={status}>
                                {TODO_STATUS_MAP[status]}
                            </span>
                        </div>
                        {pinHydrated && (
                            <button
                                type="button"
                                className="pin-heart"
                                aria-pressed={isPinned}
                                aria-label={isPinned ? '찜 해제하기' : '찜하기'}
                                onClick={() => (isPinned ? removePin(id) : addPin(todo))}
                            >
                                {isPinned ? '💖' : '🤍'}
                            </button>
                        )}
                    </div>

                    {/* 제목을 누르면 상세 내용이 펼쳐져요. */}
                    <button
                        type="button"
                        className="block w-full text-left"
                        aria-expanded={expanded}
                        onClick={() => setExpanded((prev) => !prev)}
                    >
                        <span
                            className={cn(
                                'font-cute block break-all text-lg leading-snug text-[#65564B]',
                                !expanded && 'line-clamp-2',
                            )}
                        >
                            {title}
                        </span>
                        <span className="mt-1 block text-xs text-[#75655A]">
                            📅 {dueDate ? `${formatDueDate(dueDate)}까지` : '마감일 없음'}
                        </span>
                    </button>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <button type="button" className="pill-btn" onClick={() => onChangeStatus(id, nextStatus)}>
                            {status === 'READY' ? '▶ 시작하기' : '⏸ 잠깐 멈추기'}
                        </button>
                        <button
                            type="button"
                            className="pill-btn pill-btn--done"
                            onClick={() => onComplete(id, title)}
                        >
                            ✓ 완료
                        </button>
                        <button
                            type="button"
                            className="pill-btn pill-btn--ghost ml-auto"
                            aria-expanded={expanded}
                            onClick={() => setExpanded((prev) => !prev)}
                        >
                            {expanded ? '접기 ▴' : '자세히 ▾'}
                        </button>
                    </div>

                    <AnimatePresence initial={false}>
                        {expanded && (
                            <motion.div
                                key="detail"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                            >
                                <div className="memo-detail">
                                    <TodoContentViewer content={content} />
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <Link href={`/todo/${id}/view`} className="pill-btn pill-btn--ghost">
                                        📄 상세 보기
                                    </Link>
                                    <Link href={`/todo/${id}/edit`} className="pill-btn pill-btn--ghost">
                                        ✏️ 수정
                                    </Link>
                                    <div className="ml-auto">
                                        <DeleteTodoButton id={id} title={title} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </article>
            </div>

            {/* 완료되어 구름에서 사라질 때 반짝이는 별 */}
            {!isPresent && completing && <StarBurst />}
        </motion.li>
    );
}

const SPARKS = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const distance = 60 + (i % 3) * 20;
    return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance * 0.7,
        color: ['#F2C14E', '#FFB3C7', '#7CB7E8'][i % 3],
    };
});

function StarBurst() {
    return (
        <span className="pointer-events-none absolute inset-0 z-20" aria-hidden>
            {SPARKS.map((spark, i) => (
                <motion.span
                    key={i}
                    className="absolute left-1/2 top-1/2 text-lg"
                    style={{ color: spark.color, marginLeft: -8, marginTop: -12 }}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{ x: spark.x, y: spark.y, scale: [0, 1.3, 0], opacity: [1, 1, 0] }}
                    transition={{ duration: 0.75, ease: [0.2, 0.8, 0.4, 1] }}
                >
                    ★
                </motion.span>
            ))}
        </span>
    );
}
