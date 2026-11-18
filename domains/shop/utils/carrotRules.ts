import { SHOP_ITEMS } from '../constants/shopCatalog';
import type { ShopItem } from '../types/shop.types';

/** 보상 규칙 */
export const REWARD = {
    base: 100, // 할 일 하나 완료
    onTime: 50, // 마감일 전에(또는 당일에) 완료
    dailyFirst: 100, // 오늘의 첫 완료
} as const;

/** 오늘의 특가 할인율 */
export const DAILY_DEAL_RATE = 0.3;

/** 사용자 기기 날짜 기준 'YYYY-MM-DD' */
export function todayKey(date: Date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * 완료 보상 계산
 * @param daysLeft 마감까지 남은 날 (마감일이 없으면 null)
 * @param isFirstToday 오늘 처음 보상을 받는 완료인지
 */
export function calcReward(daysLeft: number | null, isFirstToday: boolean) {
    const lines: { label: string; amount: number }[] = [{ label: '배달 완료', amount: REWARD.base }];
    if (daysLeft !== null && daysLeft >= 0) lines.push({ label: '마감 전 완료', amount: REWARD.onTime });
    if (isFirstToday) lines.push({ label: '오늘의 첫 완료', amount: REWARD.dailyFirst });
    const total = lines.reduce((sum, line) => sum + line.amount, 0);
    return { lines, total };
}

/** 날짜 문자열로 매일 같은 숫자를 만드는 작은 해시 */
function hashDay(key: string): number {
    let h = 0;
    for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return h;
}

/** 오늘의 특가 상품 (날짜마다 바뀌고, 하루 동안은 같아요) */
export function getDailyDeal(day: string = todayKey()): ShopItem {
    const candidates = SHOP_ITEMS.filter((item) => item.price > 0);
    return candidates[hashDay(day) % candidates.length];
}

/** 오늘 실제로 내야 하는 가격 (특가 반영) */
export function getPrice(item: ShopItem, day: string = todayKey()): number {
    if (item.price === 0) return 0;
    if (getDailyDeal(day).id === item.id) {
        return Math.round((item.price * (1 - DAILY_DEAL_RATE)) / 10) * 10;
    }
    return item.price;
}

export function formatCarrots(n: number): string {
    return n.toLocaleString('ko-KR');
}
