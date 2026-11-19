// 서버 저장으로 바꾸기 전, 브라우저(localStorage)에 모아 둔 당근 · 별 · 물건을 읽어요.
// 처음 로그인했을 때 한 번만 서버로 옮기고(import_local_village) 지워요.

const SHOP_KEY = 'bunny-post-shop';
const STICKER_KEY = 'bunny-post-stickers';

export interface LegacyVillage {
    carrots: number;
    stars: number;
    owned: string[];
    equippedHat: string | null;
    equippedPaper: string | null;
    placedDecor: string[];
}

function readState(key: string): Record<string, unknown> {
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
        return parsed.state ?? {};
    } catch {
        return {};
    }
}

const asNumber = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0);
const asStrings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const asString = (v: unknown) => (typeof v === 'string' ? v : null);

export function readLegacyVillage(): LegacyVillage {
    const shop = readState(SHOP_KEY);
    const stickers = readState(STICKER_KEY);
    return {
        carrots: asNumber(shop.carrots),
        stars: asNumber(stickers.stars),
        owned: asStrings(shop.owned),
        equippedHat: asString(shop.equippedHat),
        equippedPaper: asString(shop.equippedPaper),
        placedDecor: asStrings(shop.placedDecor),
    };
}

export function clearLegacyVillage(): void {
    try {
        window.localStorage.removeItem(SHOP_KEY);
        window.localStorage.removeItem(STICKER_KEY);
    } catch {
        // 저장소를 쓸 수 없는 환경이면 그냥 넘어가요.
    }
}
