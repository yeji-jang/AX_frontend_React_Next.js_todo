'use client';

import { motion } from 'motion/react';
import { cn } from '@/shared/utils/cn';
import { GrainFilter, useSvgIds } from '@/domains/todo/components/meadow/svgUtils';

export type KeeperMood = 'happy' | 'talking' | 'thanks' | 'sorry';

interface ShopKeeperProps {
    mood: KeeperMood;
    className?: string;
}

const INK = '#4A3A30';

/**
 * 잡화점 주인 다람쥐 "다람"
 * 초록 앞치마에 당근 주머니를 달고 있어요. 꼬리가 살랑살랑 흔들려요.
 */
export default function ShopKeeper({ mood, className }: ShopKeeperProps) {
    const { id, url } = useSvgIds();

    return (
        <motion.svg
            viewBox="0 0 140 160"
            role="img"
            aria-label="잡화점 주인 다람"
            className={cn('overflow-visible', className)}
            // 고마울 때는 폴짝!
            animate={mood === 'thanks' ? { y: [0, -14, 0, -6, 0] } : { y: 0 }}
            transition={{ duration: 0.7 }}
        >
            <defs>
                <radialGradient id={id('fur')} cx="0.38" cy="0.3" r="0.85">
                    <stop offset="0" stopColor="#E9B98C" />
                    <stop offset="0.6" stopColor="#C98B5A" />
                    <stop offset="1" stopColor="#A86D42" />
                </radialGradient>
                <radialGradient id={id('tail')} cx="0.4" cy="0.35" r="0.8">
                    <stop offset="0" stopColor="#E6AE7C" />
                    <stop offset="1" stopColor="#B27448" />
                </radialGradient>
                <GrainFilter id={id('grain')} strength={0.14} />
            </defs>

            <ellipse cx="66" cy="155" rx="34" ry="4.5" fill="rgba(70,110,50,0.2)" />

            <g filter={url('grain')}>
                {/* 꼬리 (살랑살랑) */}
                <g className="keeper-tail" style={{ transformOrigin: '92px 140px' }}>
                    <path
                        d="M88 142 C120 140 136 112 126 82 C118 56 92 52 86 72 C82 86 98 92 104 84 C112 74 100 66 96 74"
                        fill="none"
                        stroke={url('tail')}
                        strokeWidth="26"
                        strokeLinecap="round"
                    />
                    <path d="M116 70 C122 80 124 96 118 110" stroke="#F3D3B0" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
                </g>

                {/* 몸 + 앞치마 */}
                <ellipse cx="62" cy="122" rx="30" ry="30" fill={url('fur')} />
                <ellipse cx="62" cy="128" rx="18" ry="20" fill="#F6DEC0" />
                <path d="M38 108 Q62 100 86 108 L84 148 Q62 156 40 148 Z" fill="#8FC9A0" />
                <path d="M38 108 Q62 100 86 108" stroke="#6FAE82" strokeWidth="3" fill="none" />
                {/* 당근 주머니 */}
                <rect x="51" y="122" width="22" height="16" rx="5" fill="#7AB98C" />
                <path d="M58 126 Q62 124 66 126 Q64 133 62 136 Q60 133 58 126 Z" fill="#F59A4A" />
                <path d="M60 125 L59 122 M62 124 L62 121 M64 125 L65 122" stroke="#4E8F5C" strokeWidth="1.3" strokeLinecap="round" />
                <ellipse cx="48" cy="152" rx="11" ry="5.5" fill="#B27448" />
                <ellipse cx="76" cy="152" rx="11" ry="5.5" fill="#B27448" />

                {/* 귀 */}
                <ellipse cx="38" cy="40" rx="11" ry="14" fill={url('fur')} transform="rotate(-18 38 40)" />
                <ellipse cx="38" cy="42" rx="5.5" ry="8" fill="#F3C2A8" transform="rotate(-18 38 42)" />
                <ellipse cx="86" cy="40" rx="11" ry="14" fill={url('fur')} transform="rotate(18 86 40)" />
                <ellipse cx="86" cy="42" rx="5.5" ry="8" fill="#F3C2A8" transform="rotate(18 86 42)" />
                <path d="M34 26 L36 20 M38 26 L41 20" stroke="#A86D42" strokeWidth="2" strokeLinecap="round" />

                {/* 머리 */}
                <ellipse cx="62" cy="72" rx="36" ry="32" fill={url('fur')} />
                <ellipse cx="62" cy="84" rx="22" ry="16" fill="#F6DEC0" />
                <ellipse cx="46" cy="56" rx="10" ry="5" fill="#fff" opacity="0.35" transform="rotate(-25 46 56)" />

                <KeeperFace mood={mood} />

                {/* 손 */}
                <ellipse cx="36" cy="112" rx="7" ry="8" fill={url('fur')} />
                <motion.g
                    style={{ transformOrigin: '88px 116px' }}
                    animate={mood === 'talking' || mood === 'happy' ? { rotate: [0, -18, 0] } : { rotate: 0 }}
                    transition={{ duration: 1.4, repeat: mood === 'talking' ? Infinity : 0, ease: 'easeInOut' }}
                >
                    <ellipse cx="90" cy="106" rx="7" ry="8" fill={url('fur')} />
                </motion.g>
            </g>
        </motion.svg>
    );
}

function KeeperFace({ mood }: { mood: KeeperMood }) {
    const line = { stroke: INK, strokeWidth: 3, strokeLinecap: 'round' as const, fill: 'none' };

    const eyes =
        mood === 'thanks' ? (
            <>
                <path d="M44 70 Q49 63 54 70" {...line} />
                <path d="M70 70 Q75 63 80 70" {...line} />
            </>
        ) : (
            <g className="bunny-blink">
                <ellipse cx="49" cy="69" rx="4" ry="5" fill={INK} />
                <ellipse cx="75" cy="69" rx="4" ry="5" fill={INK} />
                <circle cx="50.5" cy="67" r="1.4" fill="#fff" />
                <circle cx="76.5" cy="67" r="1.4" fill="#fff" />
            </g>
        );

    const mouth =
        mood === 'sorry' ? (
            <path d="M56 90 Q62 86 68 90" {...line} strokeWidth={2.4} stroke="#B5525E" />
        ) : mood === 'thanks' || mood === 'talking' ? (
            <path d="M55 86 Q62 96 69 86 Z" fill="#C2566A" />
        ) : (
            <path d="M56 87 Q59 91 62 87 Q65 91 68 87" {...line} strokeWidth={2.2} stroke="#C2566A" />
        );

    return (
        <>
            {eyes}
            {mood === 'sorry' && (
                <>
                    <path d="M42 60 L54 63" {...line} strokeWidth={2.4} />
                    <path d="M82 60 L70 63" {...line} strokeWidth={2.4} />
                </>
            )}
            <ellipse cx="40" cy="80" rx="6.5" ry="4" fill="#FF9FB0" opacity="0.55" />
            <ellipse cx="84" cy="80" rx="6.5" ry="4" fill="#FF9FB0" opacity="0.55" />
            <ellipse cx="62" cy="80" rx="4" ry="3" fill="#6B4630" />
            {mouth}
        </>
    );
}
