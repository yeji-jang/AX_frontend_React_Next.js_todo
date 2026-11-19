import { SHOP_ITEMS } from '../constants/shopCatalog';
import type { ShopItem } from '../types/shop.types';

/** 보상 규칙 (실제 지급은 DB 함수 claim_todo_reward가 해요. 여기 값은 안내 문구용) */
export const REWARD = {
    base: 100, // 할 일 하나 완료
    onTime: 50, // 마감일 전에(또는 당일에) 완료
    dailyFirst: 100, // 오늘의 첫 완료
} as const;

/** 오늘의 특가: 원래 가격의 70%만 받아요. (30% 할인) */
const DEAL_KEEP_PERCENT = 70;
export const DAILY_DEAL_PERCENT_OFF = 100 - DEAL_KEEP_PERCENT;

/** 사용자 기기 날짜 기준 'YYYY-MM-DD' */
export function todayKey(date: Date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** 'YYYY-MM-DD' → 1970-01-01부터 지난 날 수 */
function daysSinceEpoch(day: string): number {
    const [y, m, d] = day.split('-').map(Number);
    return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/**
 * 오늘의 특가 상품 (날짜마다 바뀌고, 하루 동안은 같아요)
 * ⚠ DB 함수 buy_shop_item과 같은 계산이에요. (가격 있는 물건을 목록 순서대로 돌아가며)
 */
export function getDailyDeal(day: string = todayKey()): ShopItem {
    const candidates = SHOP_ITEMS.filter((item) => item.price > 0);
    return candidates[daysSinceEpoch(day) % candidates.length];
}

/**
 * 오늘 실제로 내야 하는 가격 (특가 반영)
 * 부동소수점 오차 없이 DB(round)와 같은 값이 나오도록 정수로 계산해요.
 */
export function getPrice(item: ShopItem, day: string = todayKey()): number {
    if (item.price === 0) return 0;
    if (getDailyDeal(day).id === item.id) {
        return Math.round((item.price * DEAL_KEEP_PERCENT) / 1000) * 10;
    }
    return item.price;
}

export function formatCarrots(n: number): string {
    return n.toLocaleString('ko-KR');
}
