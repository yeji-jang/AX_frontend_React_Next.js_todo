'use client';

import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/shared/utils/cn';

export type BubbleTone = 'default' | 'urgent' | 'celebrate' | 'sleepy';

interface BunnySpeechBubbleProps {
    /** null이면 말풍선을 숨겨요. */
    message: React.ReactNode | null;
    /** 내용이 바뀔 때 새로 "뿅" 하고 나오게 하는 값 */
    messageKey: string;
    tone?: BubbleTone;
    /** 꼬리 위치 */
    tail?: 'right' | 'left';
    className?: string;
}

// 토끼의 말풍선: 말랑하게 커지며 나타났다가, 작아지며 사라져요.
export default function BunnySpeechBubble({
    message,
    messageKey,
    tone = 'default',
    tail = 'right',
    className,
}: BunnySpeechBubbleProps) {
    return (
        <div className={cn('pointer-events-none', className)} aria-live="polite">
            <AnimatePresence mode="wait">
                {message && (
                    <motion.div
                        key={messageKey}
                        className="speech-bubble pointer-events-auto"
                        data-tone={tone}
                        data-tail={tail}
                        style={{ originX: tail === 'right' ? 0.85 : 0.15, originY: 1 }}
                        initial={{ opacity: 0, scale: 0.6, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 6, transition: { duration: 0.18 } }}
                        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    >
                        {message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
