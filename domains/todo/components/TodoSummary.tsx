'use client';

import { cn } from '@/shared/utils/cn';
import { getStarsToNextHat, HAT_LEVELS, type HatTier } from '../stores/useStickerStore';

export type TodoTab = 'all' | 'today';

interface TodoSummaryProps {
    activeCount: number;
    doneCount: number;
    urgentCount: number;
    todayCount: number;
    stars: number;
    hatTier: HatTier;
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
    hatTier,
    tab,
    onTabChange,
}: TodoSummaryProps) {
    const toNext = getStarsToNextHat(stars);

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ul className="flex flex-wrap gap-2" aria-label="할 일 현황">
                <li className="stat-chip">📬 할 일 <strong>{activeCount}</strong></li>
                <li className="stat-chip">✅ 완료 <strong>{doneCount}</strong></li>
                {urgentCount > 0 && (
                    <li className="stat-chip stat-chip--urgent">🚨 긴급 <strong>{urgentCount}</strong></li>
                )}
                <li
                    className="stat-chip"
                    title={toNext === null ? '모든 모자를 모았어요!' : `다음 모자까지 별 ${toNext}개`}
                >
                    ⭐ <strong>{stars}</strong> · {HAT_LEVELS[hatTier].name}
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
