'use client';

import { motion, type TargetAndTransition, type Transition } from 'motion/react';
import { useId } from 'react';
import { cn } from '@/shared/utils/cn';
import type { HatId } from '@/domains/shop/types/shop.types';
import type { BunnyExpression, BunnyHolding } from '../../types/bunny';

interface BunnyCharacterProps {
    expression: BunnyExpression;
    holding?: BunnyHolding;
    /** 뛰는 중이면 귀가 몸을 늦게 따라오며 펄럭여요. (팔로스루) */
    hopping?: boolean;
    /** 손 흔들기 */
    waving?: boolean;
    /** 쓰고 있는 모자 (잡화점에서 산 모자) */
    hat?: HatId;
    className?: string;
}

const INK = '#4A3A30';
const MOUTH = '#C2566A';

// 숨쉬기: 몸이 아주 살짝 부풀었다 줄어들어요.
function getBreath(expression: BunnyExpression, hopping: boolean) {
    if (hopping) {
        return { animate: { scaleX: 1, scaleY: 1 }, transition: { duration: 0.1 } };
    }
    const fast = expression === 'worried' || expression === 'excited';
    return {
        animate: { scaleY: [1, fast ? 1.04 : 1.025, 1], scaleX: [1, fast ? 0.985 : 0.99, 1] },
        transition: { duration: fast ? 1 : 2.8, repeat: Infinity, ease: 'easeInOut' },
    } satisfies { animate: TargetAndTransition; transition: Transition };
}

// 귀: 뛸 때는 펄럭, 평소에는 가끔 쫑긋
function getEar(side: 'l' | 'r', hopping: boolean) {
    const dir = side === 'l' ? 1 : -1;
    if (hopping) {
        return {
            animate: { rotate: [0, 16 * dir, -9 * dir, 0] },
            transition: { duration: 0.46, repeat: Infinity, ease: 'easeInOut' },
        } satisfies { animate: TargetAndTransition; transition: Transition };
    }
    return {
        animate: { rotate: [0, 0, -12 * dir, 5 * dir, 0] },
        transition: {
            duration: 4.4,
            times: [0, 0.78, 0.84, 0.91, 1],
            repeat: Infinity,
            delay: side === 'l' ? 0 : 0.12,
        },
    } satisfies { animate: TargetAndTransition; transition: Transition };
}

// 둥글고 말랑한 3D 클레이 스타일 토끼 배달원
export default function BunnyCharacter({
    expression,
    holding = 'none',
    hopping = false,
    waving = false,
    hat = 'cap',
    className,
}: BunnyCharacterProps) {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
    const id = (name: string) => `${name}-${uid}`;
    const url = (name: string) => `url(#${id(name)})`;

    const breath = getBreath(expression, hopping);
    const earL = getEar('l', hopping);
    const earR = getEar('r', hopping);

    return (
        <svg
            viewBox="0 0 120 160"
            role="img"
            aria-label="토끼 배달원"
            className={cn('overflow-visible', className)}
        >
            <defs>
                <radialGradient id={id('fur')} cx="0.38" cy="0.28" r="0.85">
                    <stop offset="0" stopColor="#FFFFFF" />
                    <stop offset="0.55" stopColor="#FBF4EC" />
                    <stop offset="1" stopColor="#E2CFBE" />
                </radialGradient>
                <radialGradient id={id('cap')} cx="0.35" cy="0.25" r="0.85">
                    <stop offset="0" stopColor="#B9DEF7" />
                    <stop offset="0.6" stopColor="#7CB7E8" />
                    <stop offset="1" stopColor="#4F8CC9" />
                </radialGradient>
                <radialGradient id={id('straw')} cx="0.35" cy="0.25" r="0.9">
                    <stop offset="0" stopColor="#FFF1C7" />
                    <stop offset="0.6" stopColor="#F4D58F" />
                    <stop offset="1" stopColor="#D9B061" />
                </radialGradient>
                <radialGradient id={id('gold')} cx="0.35" cy="0.25" r="0.9">
                    <stop offset="0" stopColor="#FFF6C8" />
                    <stop offset="0.55" stopColor="#FFD54F" />
                    <stop offset="1" stopColor="#E0A42E" />
                </radialGradient>
                <radialGradient id={id('shine')}>
                    <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
                {/* 점토 표면의 오돌토돌한 질감 */}
                <filter id={id('grain')} x="-10%" y="-10%" width="120%" height="120%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="noise" />
                    <feColorMatrix
                        in="noise"
                        type="matrix"
                        values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0.16 0"
                        result="dots"
                    />
                    <feComposite in="dots" in2="SourceGraphic" operator="in" result="grainIn" />
                    <feMerge>
                        <feMergeNode in="SourceGraphic" />
                        <feMergeNode in="grainIn" />
                    </feMerge>
                </filter>
            </defs>

            <ellipse cx="60" cy="155" rx="30" ry="4.5" fill="rgba(70,110,50,0.22)" />

            <motion.g
                filter={url('grain')}
                style={{ originX: 0.5, originY: 1 }}
                animate={breath.animate}
                transition={breath.transition}
            >
                {/* 귀 */}
                <motion.g style={{ originX: 0.5, originY: 1 }} animate={earL.animate} transition={earL.transition}>
                    <ellipse cx="44" cy="30" rx="10" ry="27" fill={url('fur')} transform="rotate(-14 44 30)" />
                    <ellipse cx="44" cy="32" rx="4.5" ry="19" fill="#FFC2CC" transform="rotate(-14 44 32)" />
                </motion.g>
                <motion.g style={{ originX: 0.5, originY: 1 }} animate={earR.animate} transition={earR.transition}>
                    <ellipse cx="77" cy="30" rx="10" ry="27" fill={url('fur')} transform="rotate(14 77 30)" />
                    <ellipse cx="77" cy="32" rx="4.5" ry="19" fill="#FFC2CC" transform="rotate(14 77 32)" />
                </motion.g>

                {/* 꼬리 · 몸 · 발 */}
                <circle cx="90" cy="138" r="9" fill={url('fur')} />
                <ellipse cx="60" cy="126" rx="30" ry="26" fill={url('fur')} />
                <ellipse cx="46" cy="150" rx="12" ry="6.5" fill="#EEDDCD" />
                <ellipse cx="74" cy="150" rx="12" ry="6.5" fill="#EEDDCD" />

                {/* 머리 */}
                <ellipse cx="60" cy="82" rx="36" ry="32" fill={url('fur')} />
                <ellipse cx="44" cy="68" rx="10" ry="6" fill={url('shine')} transform="rotate(-25 44 68)" />

                <Hat hat={hat} capFill={url('cap')} strawFill={url('straw')} goldFill={url('gold')} shineFill={url('shine')} />

                <BunnyFace expression={expression} />

                <Holding holding={holding} waving={waving} furFill={url('fur')} />
            </motion.g>
        </svg>
    );
}

function Hat({
    hat,
    capFill,
    strawFill,
    goldFill,
    shineFill,
}: {
    hat: HatId;
    capFill: string;
    strawFill: string;
    goldFill: string;
    shineFill: string;
}) {
    switch (hat) {
        case 'straw':
            return (
                <>
                    <ellipse cx="60" cy="62" rx="44" ry="9" fill={strawFill} />
                    <path d="M36 62 C36 32 84 32 84 62 Z" fill={strawFill} />
                    <path d="M36.5 55 Q60 50 83.5 55 L84 61 Q60 56 36 61 Z" fill="#F28B82" />
                    <circle cx="78" cy="56" r="4.5" fill="#FFF4DC" />
                    <circle cx="78" cy="56" r="2" fill="#F2C14E" />
                    <ellipse cx="50" cy="42" rx="8" ry="3.5" fill={shineFill} />
                </>
            );
        case 'sprout':
            return (
                <>
                    <path d="M27 72 Q60 38 93 72" stroke="#F2C14E" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                    <path d="M60 55 Q59 44 61 34" stroke="#6BAF4F" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <ellipse cx="53" cy="35" rx="9" ry="5" fill="#8FD16F" transform="rotate(-28 53 35)" />
                    <ellipse cx="69" cy="31" rx="10" ry="5.5" fill="#A8D68B" transform="rotate(24 69 31)" />
                    <path d="M47 37 L58 34 M63 30 L76 33" stroke="#6BAF4F" strokeWidth="1.2" strokeLinecap="round" />
                </>
            );
        case 'beret':
            return (
                <>
                    <path d="M59 44 L61 36" stroke="#B5525E" strokeWidth="3.5" strokeLinecap="round" />
                    <ellipse cx="58" cy="54" rx="36" ry="13" fill="#E0707A" transform="rotate(-8 58 54)" />
                    <path d="M28 62 Q58 68 89 55" stroke="#B5525E" strokeWidth="4" fill="none" strokeLinecap="round" />
                    <ellipse cx="46" cy="49" rx="10" ry="3.5" fill={shineFill} transform="rotate(-10 46 49)" />
                </>
            );
        case 'party':
            return (
                <>
                    <path d="M43 60 L62 12 L80 58 Q61 66 43 60 Z" fill="#FFB3C7" />
                    <path d="M48 48 L75 46 M54 33 L70 32" stroke="#FFF8EE" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="57" cy="55" r="2.6" fill="#7CB7E8" />
                    <circle cx="70" cy="54" r="2.6" fill="#7CB7E8" />
                    <circle cx="62" cy="40" r="2.2" fill="#A8D68B" />
                    <circle cx="62" cy="12" r="6" fill="#FFE27A" />
                    <circle cx="60" cy="10" r="2" fill="#fff" opacity="0.8" />
                </>
            );
        case 'crown':
            return (
                <>
                    <path
                        d="M37 60 L36 34 L48 45 L60 27 L72 45 L84 34 L83 60 Q60 66 37 60 Z"
                        fill={goldFill}
                        stroke="#D49A2A"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    />
                    <circle cx="36" cy="33" r="3.2" fill="#FFF1B8" />
                    <circle cx="60" cy="26" r="3.6" fill="#FFF1B8" />
                    <circle cx="84" cy="33" r="3.2" fill="#FFF1B8" />
                    {/* 가운데 당근 보석 */}
                    <path d="M60 58 L55 47 Q60 43 65 47 Z" fill="#F59A4A" />
                    <path d="M58 45 L57 41 M60 44 L60 40 M62 45 L63 41" stroke="#6BAF4F" strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="46" cy="54" r="2.6" fill="#7CB7E8" />
                    <circle cx="74" cy="54" r="2.6" fill="#FF8FA3" />
                    <ellipse cx="45" cy="43" rx="4" ry="2" fill={shineFill} />
                </>
            );
        case 'cap':
        case 'flower':
        default:
            return (
                <>
                    {/* 배달원 모자 */}
                    <path d="M30 66 C30 36 90 36 90 66 Z" fill={capFill} />
                    <ellipse cx="75" cy="66" rx="20" ry="5" fill="#4F8CC9" />
                    <ellipse cx="48" cy="47" rx="8" ry="3.5" fill={shineFill} />
                    <circle cx="60" cy="52" r="6.5" fill="#FFF8EE" />
                    <path d="M56 50 H64 V55 H56 Z" fill="#F28B82" />
                    <path d="M56 50 L60 53 L64 50" stroke="#fff" strokeWidth="1" fill="none" />
                    {hat === 'flower' && (
                        // 꽃 장식
                        <g transform="translate(38 50)">
                            {[0, 72, 144, 216, 288].map((deg) => (
                                <ellipse key={deg} cx="0" cy="-5" rx="3.6" ry="4.6" fill="#FFB3C7" transform={`rotate(${deg})`} />
                            ))}
                            <circle r="3" fill="#FFE27A" />
                        </g>
                    )}
                </>
            );
    }
}

function BunnyFace({ expression }: { expression: BunnyExpression }) {
    const line = {
        stroke: INK,
        strokeWidth: 3,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        fill: 'none',
    };
    const mouthLine = { ...line, stroke: MOUTH, strokeWidth: 2.2 };
    const dotEyes = (
        <g className="bunny-blink">
            <ellipse cx="46" cy="80" rx="3.8" ry="4.8" fill={INK} />
            <ellipse cx="74" cy="80" rx="3.8" ry="4.8" fill={INK} />
            <circle cx="47.4" cy="78.2" r="1.3" fill="#fff" />
            <circle cx="75.4" cy="78.2" r="1.3" fill="#fff" />
        </g>
    );
    const happyEyes = (
        <>
            <path d="M41 81 Q46 74 51 81" {...line} />
            <path d="M69 81 Q74 74 79 81" {...line} />
        </>
    );

    let eyes: React.ReactNode = dotEyes;
    let mouth: React.ReactNode = <path d="M54 93 Q57 97 60 93 Q63 97 66 93" {...mouthLine} />;
    let extra: React.ReactNode = null;
    let blush = 0.5;

    switch (expression) {
        case 'happy':
            eyes = happyEyes;
            break;
        case 'excited':
            eyes = happyEyes;
            mouth = <path d="M53 92 Q60 104 67 92 Z" fill={MOUTH} />;
            blush = 0.75;
            extra = (
                <g fill="#FFD84D">
                    <path d="M16 70 L18 75 L23 77 L18 79 L16 84 L14 79 L9 77 L14 75 Z" />
                    <path d="M104 66 L105.5 70 L109.5 71.5 L105.5 73 L104 77 L102.5 73 L98.5 71.5 L102.5 70 Z" />
                </g>
            );
            break;
        case 'worried':
            mouth = <path d="M53 97 Q56.5 93 60 97 Q63.5 101 67 97" {...mouthLine} />;
            extra = (
                <>
                    <path d="M39 70 L50 73" {...line} strokeWidth={2.4} />
                    <path d="M81 70 L70 73" {...line} strokeWidth={2.4} />
                    <path d="M98 58 C94 65 94 69 98 69 C102 69 102 65 98 58 Z" fill="#9AD7FF" stroke="#6BBCEB" strokeWidth="1" />
                </>
            );
            break;
        case 'sleeping':
            eyes = (
                <>
                    <path d="M41 80 Q46 85 51 80" {...line} />
                    <path d="M69 80 Q74 85 79 80" {...line} />
                </>
            );
            mouth = <ellipse cx="60" cy="96" rx="2.6" ry="2" fill={MOUTH} />;
            break;
        case 'calm':
        default:
            break;
    }

    return (
        <>
            {eyes}
            <ellipse cx="38" cy="90" rx="7" ry="4.5" fill="#FF9FB0" opacity={blush} />
            <ellipse cx="82" cy="90" rx="7" ry="4.5" fill="#FF9FB0" opacity={blush} />
            <ellipse cx="60" cy="89" rx="3.2" ry="2.3" fill="#FF9FB0" />
            {mouth}
            {extra}
        </>
    );
}

function Holding({
    holding,
    waving,
    furFill,
}: {
    holding: BunnyHolding;
    waving: boolean;
    furFill: string;
}) {
    if (holding === 'letter') {
        return (
            <>
                <rect x="37" y="104" width="46" height="32" rx="5" fill="#FFFDF6" stroke="#EADBC4" strokeWidth="1.5" />
                <path d="M38 106 L60 122 L82 106" stroke="#E2CDB0" strokeWidth="2" fill="none" />
                <circle cx="60" cy="121" r="5" fill="#F28B82" />
                <path d="M58 120.5 a1.6 1.6 0 0 1 2 -1 a1.6 1.6 0 0 1 2 1 l-2 2.4 Z" fill="#fff" />
                <ellipse cx="33" cy="120" rx="7" ry="8" fill={furFill} />
                <ellipse cx="87" cy="120" rx="7" ry="8" fill={furFill} />
            </>
        );
    }

    if (holding === 'newspaper') {
        return (
            <>
                <g transform="rotate(-14 86 116)">
                    <rect x="70" y="104" width="34" height="24" rx="3" fill="#FFF8E7" stroke="#E2D2B8" />
                    <rect x="73" y="107" width="28" height="5" rx="1.5" fill="#F28C82" />
                    <path d="M73 116 H99 M73 120 H95 M73 124 H97" stroke="#CDBBA3" strokeWidth="1.6" />
                </g>
                <ellipse cx="33" cy="122" rx="7" ry="8" fill={furFill} />
                <ellipse cx="84" cy="118" rx="7" ry="8" fill={furFill} />
            </>
        );
    }

    return (
        <>
            {/* 우편 가방 */}
            <path d="M38 104 Q60 118 82 132" stroke="#A98268" strokeWidth="4" fill="none" strokeLinecap="round" />
            <rect x="70" y="124" width="26" height="20" rx="6" fill="#C79A72" />
            <path d="M70 130 Q83 138 96 130" stroke="#A98268" strokeWidth="2" fill="none" />
            <rect x="77" y="132" width="12" height="8" rx="1.5" fill="#fff" />
            <path d="M77 132 L83 136.5 L89 132" stroke="#F28B82" strokeWidth="1.2" fill="none" />
            <ellipse cx="33" cy="124" rx="7" ry="8" fill={furFill} />
            <g className={cn(waving && 'bunny-wave')}>
                <ellipse cx="92" cy="104" rx="7" ry="8" fill={furFill} />
            </g>
        </>
    );
}
