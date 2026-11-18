import { cn } from '@/shared/utils/cn';
import { GrainFilter, useSvgIds } from '@/domains/todo/components/meadow/svgUtils';
import type { DayPeriod } from '@/domains/todo/types/bunny';
import type { DecorId } from '../../types/shop.types';

interface DecorArtProps {
    id: DecorId;
    period?: DayPeriod;
    className?: string;
}

/**
 * 마을 꾸미기 소품 그림
 * 들판(VillageDecor)과 잡화점 진열대(ItemPreview)에서 똑같은 그림을 써요.
 * 움직임은 CSS 애니메이션(globals.css의 decor-*)으로만 줘서 가볍게 만들었어요.
 */
export default function DecorArt({ id, period = 'day', className }: DecorArtProps) {
    switch (id) {
        case 'sunflowers':
            return <Sunflowers className={className} />;
        case 'pumpkin':
            return <Pumpkin className={className} />;
        case 'lamp':
            return <Lamp className={className} lit={period === 'evening' || period === 'night'} />;
        case 'bench':
            return <Bench className={className} />;
        case 'pond':
            return <Pond className={className} />;
        case 'windmill':
            return <Windmill className={className} />;
        case 'balloon':
            return <Balloon className={className} />;
        case 'rainbow':
            return <Rainbow className={className} />;
    }
}

function Sunflowers({ className }: { className?: string }) {
    const flowers = [
        { x: 18, y: 26, s: 1 },
        { x: 44, y: 14, s: 1.15 },
        { x: 70, y: 28, s: 0.95 },
    ];
    return (
        <svg viewBox="0 0 90 90" aria-hidden className={className}>
            <ellipse cx="45" cy="86" rx="40" ry="4" fill="rgba(70,110,50,0.2)" />
            {flowers.map((f, i) => (
                <g key={i} className="flower-sway" style={{ animationDelay: `${-i * 0.9}s` }}>
                    <path d={`M${f.x} 88 V${f.y + 8}`} stroke="#6BAF4F" strokeWidth="3.5" strokeLinecap="round" />
                    <ellipse cx={f.x + 7} cy={f.y + 34} rx="7" ry="3.5" fill="#8FD16F" transform={`rotate(-30 ${f.x + 7} ${f.y + 34})`} />
                    <g transform={`translate(${f.x} ${f.y}) scale(${f.s})`}>
                        {Array.from({ length: 10 }, (_, k) => (
                            <ellipse key={k} cx="0" cy="-9" rx="3.6" ry="7" fill="#FFD54F" transform={`rotate(${k * 36})`} />
                        ))}
                        <circle r="6.5" fill="#A8743F" />
                        <circle r="3.5" fill="#8A5A2E" />
                    </g>
                </g>
            ))}
        </svg>
    );
}

function Pumpkin({ className }: { className?: string }) {
    const { id, url } = useSvgIds();
    return (
        <svg viewBox="0 0 60 50" aria-hidden className={className}>
            <defs>
                <radialGradient id={id('p')} cx="0.35" cy="0.3" r="0.85">
                    <stop offset="0" stopColor="#FFD39A" />
                    <stop offset="0.6" stopColor="#F5A04A" />
                    <stop offset="1" stopColor="#D97A2B" />
                </radialGradient>
                <GrainFilter id={id('g')} />
            </defs>
            <ellipse cx="30" cy="47" rx="24" ry="3" fill="rgba(70,110,50,0.22)" />
            <g filter={url('g')}>
                <ellipse cx="19" cy="30" rx="13" ry="15" fill={url('p')} />
                <ellipse cx="41" cy="30" rx="13" ry="15" fill={url('p')} />
                <ellipse cx="30" cy="30" rx="13" ry="16" fill={url('p')} />
                <path d="M30 15 Q29 9 33 6" stroke="#7A9A4A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <ellipse cx="38" cy="10" rx="6" ry="3" fill="#8FD16F" transform="rotate(-20 38 10)" />
                <ellipse cx="24" cy="22" rx="4" ry="2.4" fill="#fff" opacity="0.4" transform="rotate(-30 24 22)" />
            </g>
        </svg>
    );
}

function Lamp({ className, lit }: { className?: string; lit: boolean }) {
    return (
        <svg viewBox="0 0 40 120" aria-hidden className={cn('overflow-visible', className)}>
            {lit && <circle cx="20" cy="22" r="26" fill="#FFE9A8" opacity="0.45" className="decor-glow" />}
            <ellipse cx="20" cy="117" rx="12" ry="3" fill="rgba(70,110,50,0.22)" />
            <rect x="17" y="34" width="6" height="82" rx="3" fill="#6E7F8C" />
            <rect x="12" y="108" width="16" height="8" rx="3" fill="#5C6B77" />
            <path d="M8 16 Q20 4 32 16 Z" fill="#5C6B77" />
            <rect x="10" y="16" width="20" height="18" rx="4" fill={lit ? '#FFE27A' : '#EAF4FA'} stroke="#5C6B77" strokeWidth="2" />
            <path d="M20 16 V34" stroke="#5C6B77" strokeWidth="1.5" />
            <circle cx="20" cy="4" r="2.5" fill="#5C6B77" />
        </svg>
    );
}

function Bench({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 100 60" aria-hidden className={className}>
            <ellipse cx="50" cy="57" rx="44" ry="3.5" fill="rgba(70,110,50,0.22)" />
            <rect x="14" y="34" width="6" height="22" rx="2" fill="#8A6A52" />
            <rect x="80" y="34" width="6" height="22" rx="2" fill="#8A6A52" />
            <rect x="8" y="10" width="84" height="8" rx="4" fill="#C79A72" />
            <rect x="8" y="21" width="84" height="7" rx="3.5" fill="#B88A63" />
            <rect x="4" y="31" width="92" height="8" rx="4" fill="#D4A97F" />
            <rect x="16" y="6" width="5" height="28" rx="2" fill="#8A6A52" />
            <rect x="79" y="6" width="5" height="28" rx="2" fill="#8A6A52" />
            <ellipse cx="30" cy="12" rx="10" ry="2" fill="#fff" opacity="0.3" />
        </svg>
    );
}

function Pond({ className }: { className?: string }) {
    const { id, url } = useSvgIds();
    return (
        <svg viewBox="0 0 140 50" aria-hidden className={className}>
            <defs>
                <radialGradient id={id('w')} cx="0.45" cy="0.4" r="0.7">
                    <stop offset="0" stopColor="#CFEFFF" />
                    <stop offset="1" stopColor="#7CC3E8" />
                </radialGradient>
            </defs>
            <ellipse cx="70" cy="26" rx="68" ry="22" fill="#D9C7A6" />
            <ellipse cx="70" cy="24" rx="62" ry="18" fill={url('w')} />
            <ellipse cx="56" cy="22" rx="16" ry="4" fill="none" stroke="#fff" strokeWidth="1.6" opacity="0.7" className="decor-ripple" />
            <ellipse cx="96" cy="28" rx="10" ry="3" fill="none" stroke="#fff" strokeWidth="1.4" opacity="0.6" className="decor-ripple decor-ripple--2" />
            {/* 연잎 */}
            <path d="M34 28 a9 5 0 1 0 6 -4 L36 27 Z" fill="#7DB866" />
            <path d="M100 18 a7 4 0 1 0 5 -3 L102 17 Z" fill="#8FD16F" />
            <circle cx="104" cy="15" r="3" fill="#FFB3C7" />
            <circle cx="104" cy="15" r="1.2" fill="#FFE27A" />
            {/* 물가의 돌 */}
            <ellipse cx="12" cy="36" rx="7" ry="4.5" fill="#C9C2B8" />
            <ellipse cx="128" cy="34" rx="8" ry="5" fill="#BDB5AA" />
        </svg>
    );
}

function Windmill({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 80 110" aria-hidden className={cn('overflow-visible', className)}>
            <path d="M28 108 L32 46 H48 L52 108 Z" fill="#FFF4DC" stroke="#E2CDB0" strokeWidth="1.5" />
            <path d="M28 48 L40 32 L52 48 Z" fill="#E0707A" />
            <rect x="36" y="88" width="8" height="20" rx="4" fill="#A98268" />
            <circle cx="40" cy="66" r="4" fill="#CDEBFA" stroke="#E2CDB0" />
            <g className="decor-spin" style={{ transformOrigin: '40px 44px' }}>
                {[0, 90, 180, 270].map((deg) => (
                    <g key={deg} transform={`rotate(${deg} 40 44)`}>
                        <rect x="38.5" y="8" width="3" height="36" fill="#8A6A52" />
                        <rect x="41.5" y="10" width="11" height="28" rx="2" fill="#FFFDF8" stroke="#E2CDB0" />
                    </g>
                ))}
                <circle cx="40" cy="44" r="4.5" fill="#8A6A52" />
            </g>
        </svg>
    );
}

function Balloon({ className }: { className?: string }) {
    const { id, url } = useSvgIds();
    return (
        <svg viewBox="0 0 60 90" aria-hidden className={className}>
            <defs>
                <radialGradient id={id('b')} cx="0.35" cy="0.3" r="0.8">
                    <stop offset="0" stopColor="#FFE0E6" />
                    <stop offset="1" stopColor="#FF9FB0" />
                </radialGradient>
            </defs>
            <path d="M30 4 C8 4 2 26 12 42 L22 56 H38 L48 42 C58 26 52 4 30 4 Z" fill={url('b')} />
            <path d="M30 4 C22 14 20 40 24 56 H36 C40 40 38 14 30 4 Z" fill="#FFF4C9" />
            <path d="M23 56 L25 70 M37 56 L35 70" stroke="#A98268" strokeWidth="1.5" />
            <rect x="22" y="68" width="16" height="13" rx="3" fill="#C79A72" />
            <path d="M22 73 H38" stroke="#A98268" strokeWidth="1.5" />
            <ellipse cx="20" cy="18" rx="5" ry="8" fill="#fff" opacity="0.4" transform="rotate(20 20 18)" />
        </svg>
    );
}

function Rainbow({ className }: { className?: string }) {
    const colors = ['#FFB3B3', '#FFD39A', '#FFF1A8', '#C8EBB0', '#B9DEF7', '#D7C6F2'];
    return (
        <svg viewBox="0 0 200 104" aria-hidden className={className}>
            {colors.map((color, i) => (
                <path
                    key={color}
                    d={`M${10 + i * 8} 100 A${90 - i * 8} ${90 - i * 8} 0 0 1 ${190 - i * 8} 100`}
                    stroke={color}
                    strokeWidth="8.5"
                    fill="none"
                />
            ))}
            <ellipse cx="22" cy="98" rx="20" ry="8" fill="#fff" />
            <ellipse cx="178" cy="98" rx="20" ry="8" fill="#fff" />
        </svg>
    );
}
