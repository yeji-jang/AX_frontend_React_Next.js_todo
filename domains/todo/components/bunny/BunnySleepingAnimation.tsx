'use client';

import { motion } from 'motion/react';

/**
 * 집 침실 창문 안: 작은 침대에서 눈을 감고 쉬는 토끼
 * (Cottage의 창문 영역 안에 꽉 차게 그려져요.)
 */
export function BunnyBedroom() {
    return (
        <motion.div
            className="h-full w-full"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
        >
            <svg viewBox="0 0 70 60" className="h-full w-full" aria-label="침대에서 쉬고 있는 토끼">
                {/* 침대 */}
                <rect x="4" y="30" width="8" height="26" rx="3" fill="#A98268" />
                <rect x="8" y="40" width="58" height="12" rx="5" fill="#C49A7B" />
                <rect x="10" y="34" width="20" height="10" rx="5" fill="#FFFFFF" />
                {/* 숨 쉬는 이불 */}
                <motion.path
                    d="M22 46 C22 32 66 32 66 46 Z"
                    fill="#F28B82"
                    style={{ originX: 0.5, originY: 1 }}
                    animate={{ scaleY: [1, 1.08, 1] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <path d="M30 40 H60" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
                {/* 토끼 머리 */}
                <ellipse cx="14" cy="22" rx="3.5" ry="10" fill="#FBF4EC" transform="rotate(-50 14 22)" />
                <ellipse cx="22" cy="20" rx="3.5" ry="10" fill="#FBF4EC" transform="rotate(-30 22 20)" />
                <ellipse cx="22" cy="34" rx="11" ry="9.5" fill="#FBF4EC" />
                <path d="M15 34 Q18 36.5 21 34" stroke="#4A3A30" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                <path d="M24 34 Q27 36.5 30 34" stroke="#4A3A30" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                <ellipse cx="13.5" cy="38" rx="2.6" ry="1.6" fill="#FF9FB0" opacity="0.6" />
                <ellipse cx="31" cy="38" rx="2.6" ry="1.6" fill="#FF9FB0" opacity="0.6" />
            </svg>
        </motion.div>
    );
}

/** 창문 위로 천천히 떠오르는 Zzz와 별·하트 */
export function SleepingBubbles() {
    const items = [
        { text: 'Z', size: 14, x: 0, delay: 0 },
        { text: 'z', size: 11, x: 10, delay: 1.1 },
        { text: 'z', size: 9, x: 18, delay: 2.2 },
        { text: '♥', size: 10, x: -14, delay: 0.6 },
        { text: '✦', size: 10, x: 26, delay: 1.7 },
    ];
    return (
        <div className="pointer-events-none absolute left-[60%] top-[48%]" aria-hidden>
            {items.map((item, i) => (
                <motion.span
                    key={i}
                    className="absolute font-cute"
                    style={{
                        left: item.x,
                        fontSize: item.size,
                        color: item.text === '♥' ? '#F28B82' : item.text === '✦' ? '#F2C14E' : '#7CB7E8',
                    }}
                    animate={{ y: [0, -46], x: [0, 6, -4, 4], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 3.3, delay: item.delay, repeat: Infinity, ease: 'easeOut' }}
                >
                    {item.text}
                </motion.span>
            ))}
        </div>
    );
}
