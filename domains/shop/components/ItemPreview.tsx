'use client';

import BunnyCharacter from '@/domains/todo/components/bunny/BunnyCharacter';
import type { DayPeriod } from '@/domains/todo/types/bunny';
import { cn } from '@/shared/utils/cn';
import type { ShopItem } from '../types/shop.types';
import DecorArt from './decor/DecorArt';

interface ItemPreviewProps {
    item: ShopItem;
    period?: DayPeriod;
    className?: string;
}

/** 진열대 위 물건 그림 (모자는 토끼가 직접 써 보고, 편지지는 작은 카드로 보여줘요) */
export default function ItemPreview({ item, period, className }: ItemPreviewProps) {
    switch (item.category) {
        case 'hat':
            return (
                <BunnyCharacter
                    expression="happy"
                    hat={item.id}
                    className={cn('h-auto w-full', className)}
                />
            );
        case 'decor':
            return <DecorArt id={item.id} period={period} className={cn('h-auto w-full', className)} />;
        case 'paper':
            return (
                <div className={cn('memo-card paper-swatch', className)} data-paper={item.id} aria-hidden>
                    <span className="paper-swatch__line" />
                    <span className="paper-swatch__line paper-swatch__line--short" />
                    <span className="paper-swatch__line" />
                </div>
            );
    }
}
