import type { DecorId, HatId, ItemId, PaperId, ShopCategory, ShopItem } from '../types/shop.types';

// 다람 잡화점에서 파는 물건 목록
export const SHOP_ITEMS: ShopItem[] = [
    // ── 모자 ──
    { category: 'hat', id: 'cap', name: '배달원 모자', price: 0, description: '토끼가 처음부터 쓰던 하늘색 모자예요.' },
    { category: 'hat', id: 'sprout', name: '새싹 머리띠', price: 250, description: '쑥쑥 자라라! 머리 위에 새싹이 퐁.' },
    { category: 'hat', id: 'flower', name: '꽃 장식 모자', price: 0, requiresStars: 3, description: '별 스티커 3개를 모으면 선물로 드려요.' },
    { category: 'hat', id: 'party', name: '파티 고깔', price: 400, description: '할 일을 다 끝낸 날엔 파티를 해야죠!' },
    { category: 'hat', id: 'beret', name: '화가 베레모', price: 550, description: '오늘은 조금 예술적인 기분이에요.' },
    { category: 'hat', id: 'straw', name: '밀짚 모자', price: 0, requiresStars: 7, description: '별 스티커 7개를 모으면 선물로 드려요.' },
    { category: 'hat', id: 'crown', name: '당근 왕관', price: 2000, requiresStars: 15, description: '부지런한 토끼만 쓸 수 있는 반짝 왕관.' },

    // ── 마을 꾸미기 ──
    { category: 'decor', id: 'pumpkin', name: '동글 호박', price: 200, description: '길가에 놓으면 가을 냄새가 나요.' },
    { category: 'decor', id: 'sunflowers', name: '해바라기 화단', price: 300, description: '해를 보며 방긋 웃는 꽃들.' },
    { category: 'decor', id: 'lamp', name: '가로등', price: 500, description: '저녁이 되면 따스하게 불이 켜져요.' },
    { category: 'decor', id: 'bench', name: '나무 벤치', price: 600, description: '토끼가 쉬어 갈 수 있는 자리.' },
    { category: 'decor', id: 'pond', name: '작은 연못', price: 900, description: '연잎 위에서 물결이 찰랑찰랑.' },
    { category: 'decor', id: 'balloon', name: '열기구', price: 1200, description: '하늘 위를 둥실둥실 떠다녀요.' },
    { category: 'decor', id: 'windmill', name: '풍차', price: 1500, description: '언덕 위에서 빙글빙글 돌아가요.' },
    { category: 'decor', id: 'rainbow', name: '무지개', price: 2500, description: '마을 하늘에 언제나 무지개가!' },

    // ── 편지지 (할 일 카드 무늬) ──
    { category: 'paper', id: 'cream', name: '크림 편지지', price: 0, description: '기본 크림색 편지지예요.' },
    { category: 'paper', id: 'lined', name: '줄 노트', price: 200, description: '또박또박 줄이 그어진 노트.' },
    { category: 'paper', id: 'strawberry', name: '딸기 우유', price: 350, description: '분홍빛 물방울 무늬 편지지.' },
    { category: 'paper', id: 'mint', name: '민트 체크', price: 350, description: '산뜻한 민트색 체크 무늬.' },
    { category: 'paper', id: 'starry', name: '별밤 편지지', price: 800, description: '반짝이는 별이 쏟아지는 밤하늘.' },
];

export const CATEGORY_LABELS: Record<ShopCategory, string> = {
    hat: '🎩 모자',
    decor: '🌻 마을 꾸미기',
    paper: '💌 편지지',
};

/** 처음부터 가지고 있는 물건 */
export const STARTER_ITEMS: ItemId[] = ['cap', 'cream'];
export const DEFAULT_HAT: HatId = 'cap';
export const DEFAULT_PAPER: PaperId = 'cream';

export function getItem(id: ItemId): ShopItem | undefined {
    return SHOP_ITEMS.find((item) => item.id === id);
}

export function isDecorId(id: ItemId): id is DecorId {
    return getItem(id)?.category === 'decor';
}
