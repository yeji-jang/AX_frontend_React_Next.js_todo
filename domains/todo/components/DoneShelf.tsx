'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';
import type { PrioritizedTodo } from '../types/bunny';

interface DoneShelfProps {
    entries: PrioritizedTodo[];
    /** 완료를 취소하고 다시 준비중으로 */
    onRestore: (id: string) => void;
}

// 완료한 할 일 보관함 (미완료 목록과 분리)
export default function DoneShelf({ entries, onRestore }: DoneShelfProps) {
    const [open, setOpen] = useState(false);

    if (entries.length === 0) return null;

    return (
        <section className="done-shelf mt-8" aria-label="완료한 할 일">
            <button
                type="button"
                className="flex w-full items-center justify-between gap-2 text-left"
                aria-expanded={open}
                onClick={() => setOpen((prev) => !prev)}
            >
                <span className="font-cute text-base text-[#65564B]">
                    ⭐ 완료한 일 <strong>{entries.length}</strong>개
                </span>
                <span className="text-sm text-[#75655A]">{open ? '접기 ▴' : '펼치기 ▾'}</span>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-3 space-y-2 overflow-hidden"
                    >
                        {entries.map(({ todo }) => (
                            <li key={todo.id} className="done-item">
                                <Link href={`/todo/${todo.id}/view`} className="min-w-0 grow truncate hover:underline">
                                    <span aria-hidden>✓ </span>
                                    {todo.title}
                                </Link>
                                <button type="button" className="pill-btn pill-btn--ghost shrink-0" onClick={() => onRestore(todo.id)}>
                                    ↩ 되돌리기
                                </button>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </section>
    );
}
