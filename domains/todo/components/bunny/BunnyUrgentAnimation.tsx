'use client';

import NewspaperEffect from './NewspaperEffect';

export interface NewspaperBurst {
    key: number;
    /** 토끼 기본 위치에서 가로로 떨어진 거리(px) */
    x: number;
}

interface BunnyUrgentAnimationProps {
    bursts: NewspaperBurst[];
    headline: string;
}

/**
 * 긴급 모드에서 토끼가 뛰어다니며 신문을 뿌린 자리들
 * 신문은 토끼를 따라 움직이지 않고, 뿌린 자리에서 날아올라야 자연스러워서
 * 토끼 기본 위치를 기준으로 x만큼 떨어진 곳에 고정해서 그려요.
 */
export default function BunnyUrgentAnimation({ bursts, headline }: BunnyUrgentAnimationProps) {
    return (
        <>
            {bursts.map((burst) => (
                <div
                    key={burst.key}
                    className="pointer-events-none absolute inset-0"
                    style={{ transform: `translateX(${burst.x}px)` }}
                >
                    <NewspaperEffect headline={headline} seed={burst.key} />
                </div>
            ))}
        </>
    );
}
