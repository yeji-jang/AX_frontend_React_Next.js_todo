'use client';

import { motion } from 'motion/react';
import { GrainFilter, useSvgIds } from './svgUtils';

interface MailboxProps {
    /** 우체통 문이 열렸는지 (토끼가 나올 때) */
    open?: boolean;
    /** 아직 시작하지 않은(준비중) 할 일 수 → 우체통 위에 편지가 쌓여요. */
    letters?: number;
    className?: string;
}

const SPRING = { type: 'spring' as const, stiffness: 260, damping: 16 };

// 빨간 우체통
export default function Mailbox({ open = false, letters = 0, className }: MailboxProps) {
    const { id, url } = useSvgIds();
    const visibleLetters = Math.min(letters, 4);

    return (
        <div className={className}>
            <svg viewBox="0 0 110 170" aria-hidden className="h-auto w-full overflow-visible">
                <defs>
                    <radialGradient id={id('red')} cx="0.35" cy="0.3" r="0.85">
                        <stop offset="0" stopColor="#FFC0B9" />
                        <stop offset="0.55" stopColor="#F28B82" />
                        <stop offset="1" stopColor="#D9655C" />
                    </radialGradient>
                    <linearGradient id={id('wood')} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#C49A7B" />
                        <stop offset="1" stopColor="#A98268" />
                    </linearGradient>
                    <GrainFilter id={id('grain')} />
                </defs>

                <ellipse cx="55" cy="166" rx="26" ry="4" fill="rgba(70,110,50,0.22)" />

                <g filter={url('grain')}>
                    <rect x="48" y="96" width="14" height="70" rx="4" fill={url('wood')} />
                    {/* 몸통 */}
                    <path d="M16 100 V58 A39 34 0 0 1 94 58 V100 Z" fill={url('red')} />
                    <ellipse cx="38" cy="44" rx="13" ry="5" fill="#fff" opacity="0.5" transform="rotate(-20 38 44)" />
                    {/* 편지 넣는 구멍 */}
                    <rect x="37" y="58" width="36" height="6" rx="3" fill="#B9524A" />
                    {/* 문 안쪽 (열리면 보여요) */}
                    <rect x="26" y="70" width="58" height="26" rx="7" fill="#8E3F39" />
                </g>

                {/* 문: 아래쪽을 축으로 앞으로 젖혀져요. */}
                <motion.g
                    style={{ originX: 0.5, originY: 1 }}
                    initial={false}
                    animate={{ scaleY: open ? -0.35 : 1 }}
                    transition={SPRING}
                >
                    <rect x="26" y="70" width="58" height="26" rx="7" fill="#E8776E" />
                    <circle cx="55" cy="83" r="3.2" fill="#FFE27A" />
                </motion.g>

                {/* 깃발: 편지가 있으면 올라가요. */}
                <motion.g
                    style={{ originX: 0, originY: 1 }}
                    initial={false}
                    animate={{ rotate: letters > 0 ? 0 : 90 }}
                    transition={SPRING}
                >
                    <rect x="94" y="46" width="5" height="40" rx="2.5" fill="#A98268" />
                    <rect x="98" y="46" width="15" height="12" rx="3" fill="#FFD45C" />
                </motion.g>

                {/* 쌓인 편지 */}
                {Array.from({ length: visibleLetters }, (_, i) => (
                    <motion.g
                        key={i}
                        initial={{ y: -14, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ ...SPRING, delay: i * 0.06 }}
                    >
                        <g transform={`translate(${36 + (i % 2) * 6} ${20 - i * 7}) rotate(${(i % 2 ? 1 : -1) * (6 + i * 2)} 19 7)`}>
                            <rect width="38" height="14" rx="2.5" fill="#FFFDF6" stroke="#EADBC4" />
                            <path d="M1 1 L19 9 L37 1" stroke="#E2CDB0" strokeWidth="1.4" fill="none" />
                            <circle cx="19" cy="9" r="2.6" fill="#F28B82" />
                        </g>
                    </motion.g>
                ))}
            </svg>

            {letters > 0 && (
                <span
                    className="absolute -right-2 top-1 rounded-full bg-[#F28B82] px-1.5 text-[11px] font-bold leading-5 text-white shadow"
                    aria-label={`준비중인 편지 ${letters}통`}
                >
                    {letters}
                </span>
            )}
        </div>
    );
}
