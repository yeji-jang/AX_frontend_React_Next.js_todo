'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useBunnyStore } from '../stores/useBunnyStore';
import type { PrioritizedTodo } from '../types/bunny';
import { getUrgentHeadline } from '../utils/deadlineUtils';

interface UrgentToastProps {
    /** 토끼가 긴급 알림 중인지 */
    active: boolean;
    urgent: PrioritizedTodo[];
}

const TOAST_DURATION_MS = 7000;

/**
 * 긴급 알림 토스트
 * 긴급 할 일이 여러 개여도 토스트는 하나로 묶어서 보여주고,
 * 같은 긴급 목록에 대해서는 한 번만 띄워요.
 */
export default function UrgentToast({ active, urgent }: UrgentToastProps) {
    const shownKey = useBunnyStore((state) => state.shownUrgentToastKey);
    const markShown = useBunnyStore((state) => state.markUrgentToastShown);
    const [visibleKey, setVisibleKey] = useState<string | null>(null);

    const key = urgent.map((p) => p.todo.id).sort().join(',');

    useEffect(() => {
        if (!active || !key || shownKey === key) return;
        const timer = setTimeout(() => {
            markShown(key);
            setVisibleKey(key);
        }, 0);
        return () => clearTimeout(timer);
    }, [active, key, shownKey, markShown]);

    useEffect(() => {
        if (!visibleKey) return;
        const timer = setTimeout(() => setVisibleKey(null), TOAST_DURATION_MS);
        return () => clearTimeout(timer);
    }, [visibleKey]);

    const top = urgent[0];

    return (
        <AnimatePresence>
            {visibleKey && top && (
                <motion.div
                    role="status"
                    className="urgent-toast"
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                >
                    <span className="text-2xl" aria-hidden>
                        📰
                    </span>
                    <div className="min-w-0 grow">
                        <p className="font-cute text-base">마감 임박! {urgent.length > 1 && `${urgent.length}개의 할 일`}</p>
                        <p className="truncate text-sm">
                            &lsquo;{top.todo.title}&rsquo; {top.daysLeft != null && getUrgentHeadline(top.daysLeft)}
                            {urgent.length > 1 && ` 외 ${urgent.length - 1}개`}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="pill-btn pill-btn--ghost shrink-0"
                        onClick={() => setVisibleKey(null)}
                        aria-label="알림 닫기"
                    >
                        닫기
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
