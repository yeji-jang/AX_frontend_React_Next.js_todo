'use client';

import { cn } from '@/shared/utils/cn';
import { SHOP_ITEMS } from '@/domains/shop/constants/shopCatalog';
import Link from 'next/link';

/** 다음 별 선물(별 스티커가 필요한 잡화점 물건)까지 남은 별 수 */
function getNextStarGift(stars: number) {
    const next = SHOP_ITEMS.filter((item) => item.requiresStars && item.requiresStars > stars).sort(
        (a, b) => (a.requiresStars ?? 0) - (b.requiresStars ?? 0),
    )[0];
    return next ? { name: next.name, left: (next.requiresStars ?? 0) - stars } : null;
}

export type TodoTab = 'all' | 'today';

interface TodoSummaryProps {
    activeCount: number;
    doneCount: number;
    urgentCount: number;
    todayCount: number;
    stars: number;
    tab: TodoTab;
    onTabChange: (tab: TodoTab) => void;
}

// 할 일 현황 + 오늘/전체 탭
export default function TodoSummary({
    activeCount,
    doneCount,
    urgentCount,
    todayCount,
    stars,
    tab,
    onTabChange,
}: TodoSummaryProps) {
    const nextGift = getNextStarGift(stars);

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ul className="flex flex-wrap gap-2" aria-label="할 일 현황">
                <li className="stat-chip">📬 할 일 <strong>{activeCount}</strong></li>
                <li className="stat-chip">✅ 완료 <strong>{doneCount}</strong></li>
                {urgentCount > 0 && (
                    <li className="stat-chip stat-chip--urgent">🚨 긴급 <strong>{urgentCount}</strong></li>
                )}
                <li className="stat-chip">
                    <Link
                        href="/shop"
                        title={nextGift ? `별 ${nextGift.left}개 더 모으면 '${nextGift.name}'을(를) 받을 수 있어요` : '별 선물을 모두 받을 수 있어요!'}
                    >
                        ⭐ <strong>{stars}</strong>
                        {nextGift && <span className="text-[#75655A]"> · 선물까지 {nextGift.left}</span>}
                    </Link>
                </li>
            </ul>

            <div className="tab-group" role="tablist" aria-label="할 일 보기">
                {(
                    [
                        ['all', `전체 ${activeCount}`],
                        ['today', `오늘까지 ${todayCount}`],
                    ] as const
                ).map(([value, label]) => (
                    <button
                        key={value}
                        type="button"
                        role="tab"
                        aria-selected={tab === value}
                        className={cn('tab-btn', tab === value && 'tab-btn--active')}
                        onClick={() => onTabChange(value)}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}
