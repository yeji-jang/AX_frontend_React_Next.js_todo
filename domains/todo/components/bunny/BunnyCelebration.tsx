'use client';

import { AnimatePresence, motion } from 'motion/react';

const STARS = Array.from({ length: 18 }, (_, i) => ({
    left: (i * 53) % 100,
    delay: (i % 6) * 0.08,
    size: 12 + (i % 3) * 6,
    drift: ((i % 5) - 2) * 18,
    color: ['#F2C14E', '#FFB3C7', '#7CB7E8', '#A8D68B'][i % 4],
}));

interface BunnyCelebrationProps {
    /** 축하 이벤트 키 (null이면 숨김) */
    eventKey: number | null;
}

/**
 * 할 일 완료 축하: 마을 위로 별이 쏟아지고 "별 스티커 +1" 배지가 떠요.
 */
export default function BunnyCelebration({ eventKey }: BunnyCelebrationProps) {
    return (
        <AnimatePresence>
            {eventKey !== null && (
                <motion.div
                    key={eventKey}
                    className="pointer-events-none absolute inset-0 z-40 overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.4 } }}
                    aria-hidden
                >
                    {STARS.map((star, i) => (
                        <motion.span
                            key={i}
                            className="absolute top-0"
                            style={{ left: `${star.left}%`, fontSize: star.size, color: star.color }}
                            initial={{ y: -30, opacity: 0, rotate: 0 }}
                            animate={{ y: [-30, 260], x: [0, star.drift], opacity: [0, 1, 1, 0], rotate: 220 }}
                            transition={{ duration: 1.8, delay: star.delay, ease: 'easeIn' }}
                        >
                            ★
                        </motion.span>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
