/** 토끼가 쓸 수 있는 모자 */
export type HatId = 'cap' | 'flower' | 'straw' | 'sprout' | 'beret' | 'party' | 'crown';

/** 마을(들판·하늘)에 놓을 수 있는 소품 */
export type DecorId =
    | 'sunflowers'
    | 'pumpkin'
    | 'lamp'
    | 'bench'
    | 'pond'
    | 'windmill'
    | 'balloon'
    | 'rainbow';

/** 할 일 카드 편지지 */
export type PaperId = 'cream' | 'lined' | 'strawberry' | 'mint' | 'starry';

export type ShopCategory = 'hat' | 'decor' | 'paper';

interface BaseItem {
    name: string;
    description: string;
    /** 당근 가격 (0이면 조건을 채웠을 때 무료로 받을 수 있어요) */
    price: number;
    /** 별 스티커가 이만큼 있어야 살 수 있어요. */
    requiresStars?: number;
}

export type ShopItem =
    | (BaseItem & { category: 'hat'; id: HatId })
    | (BaseItem & { category: 'decor'; id: DecorId })
    | (BaseItem & { category: 'paper'; id: PaperId });

export type ItemId = ShopItem['id'];

/** 할 일 완료 보상 영수증 */
export interface RewardReceipt {
    /** 같은 보상이 연달아 와도 새 이벤트로 구분하기 위한 값 */
    key: number;
    title: string;
    total: number;
    lines: { label: string; amount: number }[];
    /** 이미 보상을 받은 할 일이라 이번엔 당근이 없어요. */
    repeat: boolean;
}

export type PurchaseResult = 'ok' | 'owned' | 'insufficient' | 'locked' | 'error';
