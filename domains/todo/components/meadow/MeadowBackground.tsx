'use client';

import type { DayPeriod } from '../../types/bunny';
import Cottage from './Cottage';
import { Birds, Butterfly, Flower, Hills, Tree } from './MeadowDecor';

interface MeadowBackgroundProps {
    period: DayPeriod;
    /** 하늘 영역 (구름 위 할 일 카드) */
    children: React.ReactNode;
    /** 들판 위 무대 (우체통 · 토끼) */
    stage: React.ReactNode;
    /** 집 침실 창문 안에 보여줄 것 (토끼가 잘 때) */
    bedroom?: React.ReactNode;
    /** 집 위에 띄울 말풍선 등 */
    cottageOverlay?: React.ReactNode;
}

/**
 * 동화 속 마을 배경
 *  - 위: 하늘 (해/달, 흘러가는 구름, 새, 밤에는 별) + 할 일 카드
 *  - 아래: 들판 (언덕, 집, 나무, 꽃, 나비) + 토끼 무대
 * 시간대(period)에 따라 하늘색이 바뀌어요.
 */
export default function MeadowBackground({
    period,
    children,
    stage,
    bedroom,
    cottageOverlay,
}: MeadowBackgroundProps) {
    return (
        <section className="bunny-world" data-period={period} aria-label="Bunny Post 마을">
            {/* ── 하늘 장식 ── */}
            <div className="pointer-events-none absolute inset-0" aria-hidden>
                {period === 'night' ? <div className="sky-moon" /> : <div className="sky-sun" />}
                {period === 'night' && <div className="sky-stars" />}
                <div className="sky-cloud sky-cloud--1" />
                <div className="sky-cloud sky-cloud--2" />
                <div className="sky-cloud sky-cloud--3" />
                {period !== 'night' && <Birds className="w-[56px]" />}
            </div>

            {/* ── 하늘: 할 일 ── */}
            <div className="relative z-10 px-4 pb-6 pt-5 sm:px-8 sm:pt-7">{children}</div>

            {/* ── 들판 ── */}
            <div className="meadow-ground">
                <Hills className="absolute inset-0 h-full w-full" />
                <Tree className="spot-tree-left absolute hidden sm:block" />
                <Tree className="spot-tree-right absolute hidden sm:block" fruit="#FFD45C" />

                <div className="spot-cottage absolute">
                    <Cottage period={period} className="relative">
                        {bedroom}
                    </Cottage>
                    {cottageOverlay}
                </div>

                <Flower className="absolute bottom-[18px] left-[40%] w-[15px]" />
                <Flower color="#FFE27A" className="absolute bottom-[44px] left-[44%] w-[12px]" />
                <Flower color="#B9DEF7" className="absolute bottom-[12px] right-[8%] w-[16px]" />
                <Flower className="absolute bottom-[60px] right-[22%] hidden w-[12px] sm:block" />
                <Flower color="#FFE27A" className="absolute bottom-[22px] left-[8%] hidden w-[14px] sm:block" />

                {period !== 'night' && (
                    <>
                        <Butterfly className="butterfly--1 w-[22px]" />
                        <Butterfly className="butterfly--2 hidden w-[18px] sm:block" color="#B9DEF7" />
                    </>
                )}

                {stage}
            </div>
        </section>
    );
}
