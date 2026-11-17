import { cn } from '@/shared/utils/cn';
import { GrainFilter, useSvgIds } from './svgUtils';

// 들판 장식 소품 (CSS 애니메이션만 사용해서 가볍게)

/** 언덕과 흙길 */
export function Hills({ className }: { className?: string }) {
    const { id, url } = useSvgIds();
    return (
        <svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden className={className}>
            <defs>
                <linearGradient id={id('back')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#E3F2D3" />
                    <stop offset="1" stopColor="#D9EBC7" />
                </linearGradient>
                <linearGradient id={id('front')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#BEE3A4" />
                    <stop offset="1" stopColor="#A8D68B" />
                </linearGradient>
                <linearGradient id={id('road')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FFF4DC" />
                    <stop offset="1" stopColor="#F3DEB4" />
                </linearGradient>
                <GrainFilter id={id('grain')} strength={0.12} />
            </defs>
            <g filter={url('grain')}>
                <path d="M0 110 C180 40 380 70 520 105 S850 45 1000 95 V300 H0 Z" fill={url('back')} />
                <path d="M0 165 C200 120 420 150 600 140 S880 110 1000 150 V300 H0 Z" fill={url('front')} />
                <path d="M250 300 C300 255 420 245 520 232 L590 232 C500 262 420 272 390 300 Z" fill={url('road')} />
            </g>
        </svg>
    );
}

/** 동글동글한 나무 */
export function Tree({ className, fruit = '#F28B82' }: { className?: string; fruit?: string }) {
    const { id, url } = useSvgIds();
    return (
        <svg viewBox="0 0 120 170" aria-hidden className={cn('tree-sway', className)}>
            <defs>
                <radialGradient id={id('leaf')} cx="0.35" cy="0.3" r="0.85">
                    <stop offset="0" stopColor="#D4F0B8" />
                    <stop offset="0.6" stopColor="#A8D68B" />
                    <stop offset="1" stopColor="#7DB866" />
                </radialGradient>
                <GrainFilter id={id('grain')} />
            </defs>
            <ellipse cx="60" cy="165" rx="30" ry="4" fill="rgba(70,110,50,0.2)" />
            <g filter={url('grain')}>
                <rect x="51" y="95" width="18" height="70" rx="8" fill="#A98268" />
                <circle cx="60" cy="62" r="48" fill={url('leaf')} />
                <circle cx="40" cy="48" r="7" fill={fruit} />
                <circle cx="78" cy="70" r="6.5" fill={fruit} />
                <circle cx="56" cy="88" r="6" fill={fruit} />
                <ellipse cx="42" cy="34" rx="14" ry="7" fill="#fff" opacity="0.45" transform="rotate(-30 42 34)" />
            </g>
        </svg>
    );
}

/** 작은 꽃 */
export function Flower({ color = '#FFB3C7', className }: { color?: string; className?: string }) {
    return (
        <svg viewBox="0 0 30 40" aria-hidden className={cn('flower-sway', className)}>
            <path d="M15 40 V20" stroke="#7DB866" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="20" cy="30" rx="5" ry="2.5" fill="#A8D68B" transform="rotate(-30 20 30)" />
            {[0, 72, 144, 216, 288].map((deg) => (
                <ellipse key={deg} cx="15" cy="7" rx="5" ry="6.5" fill={color} transform={`rotate(${deg} 15 14)`} />
            ))}
            <circle cx="15" cy="14" r="4.5" fill="#FFE27A" />
        </svg>
    );
}

/** 팔랑팔랑 나비 */
export function Butterfly({ className, color = '#FFC2CC' }: { className?: string; color?: string }) {
    return (
        <div className={cn('butterfly-path', className)} aria-hidden>
            <svg viewBox="0 0 30 24" className="butterfly-wings h-auto w-full">
                <ellipse cx="9" cy="9" rx="8" ry="7" fill={color} />
                <ellipse cx="21" cy="9" rx="8" ry="7" fill={color} />
                <ellipse cx="10" cy="18" rx="5" ry="4.5" fill={color} opacity="0.85" />
                <ellipse cx="20" cy="18" rx="5" ry="4.5" fill={color} opacity="0.85" />
                <rect x="14" y="4" width="2" height="17" rx="1" fill="#65564B" />
            </svg>
        </div>
    );
}

/** 하늘을 가로지르는 작은 새 */
export function Birds({ className }: { className?: string }) {
    return (
        <div className={cn('birds-path', className)} aria-hidden>
            <svg viewBox="0 0 60 20" className="h-auto w-full">
                <path className="bird-flap" d="M2 10 Q8 2 14 10 Q20 2 26 10" stroke="#8C7B6E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                <path className="bird-flap bird-flap--2" d="M34 14 Q39 7 44 14 Q49 7 54 14" stroke="#8C7B6E" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
        </div>
    );
}
