'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useStickerStore } from '@/domains/todo/stores/useStickerStore';
import { DEFAULT_HAT, DEFAULT_PAPER, getItem, STARTER_ITEMS } from '../constants/shopCatalog';
import type { DecorId, HatId, ItemId, PaperId, PurchaseResult, RewardReceipt } from '../types/shop.types';
import { calcReward, getPrice, todayKey } from '../utils/carrotRules';

// 당근 지갑 + 가방(산 물건) + 꾸미기 설정을 한 곳에서 관리하는 스토어
// 구매(당근 차감 + 물건 추가)가 한 번의 set으로 끝나도록 하나의 스토어로 묶었어요.
// 찜목록·마감일과 같은 방식으로 브라우저(localStorage)에 저장합니다.
interface ShopStore {
    carrots: number;
    /** 이미 보상을 준 할 일 id (완료 → 되돌리기 → 완료로 당근을 계속 받는 것을 막아요) */
    rewardedTodoIds: string[];
    /** 마지막으로 '오늘의 첫 완료' 보너스를 받은 날 */
    lastBonusDay: string | null;

    owned: ItemId[];
    equippedHat: HatId;
    equippedPaper: PaperId;
    placedDecor: DecorId[];

    /** 방금 받은 보상 (화면에 영수증을 띄울 때 사용, 저장하지 않아요) */
    lastReward: RewardReceipt | null;
    _hasHydrated: boolean;

    setHasHydrated: (state: boolean) => void;
    /** 할 일 완료 보상 받기 (처음 완료한 할 일만 당근을 받아요) */
    claimReward: (todo: { id: string; title: string; daysLeft: number | null }) => RewardReceipt;
    dismissReward: () => void;
    purchase: (id: ItemId) => PurchaseResult;
    equipHat: (id: HatId) => void;
    equipPaper: (id: PaperId) => void;
    toggleDecor: (id: DecorId) => void;
}

let receiptKey = 0;

export const useShopStore = create<ShopStore>()(
    persist(
        (set, get) => ({
            carrots: 0,
            rewardedTodoIds: [],
            lastBonusDay: null,
            owned: [...STARTER_ITEMS],
            equippedHat: DEFAULT_HAT,
            equippedPaper: DEFAULT_PAPER,
            placedDecor: [],
            lastReward: null,
            _hasHydrated: false,

            setHasHydrated: (state) => set({ _hasHydrated: state }),

            claimReward: ({ id, title, daysLeft }) => {
                const state = get();
                if (state.rewardedTodoIds.includes(id)) {
                    const receipt: RewardReceipt = { key: ++receiptKey, title, total: 0, lines: [], repeat: true };
                    set({ lastReward: receipt });
                    return receipt;
                }

                const today = todayKey();
                const { lines, total } = calcReward(daysLeft, state.lastBonusDay !== today);
                const receipt: RewardReceipt = { key: ++receiptKey, title, total, lines, repeat: false };
                set({
                    carrots: state.carrots + total,
                    rewardedTodoIds: [...state.rewardedTodoIds, id],
                    lastBonusDay: today,
                    lastReward: receipt,
                });
                // 처음 완료한 할 일만 별 스티커도 받아요.
                useStickerStore.getState().addStar();
                return receipt;
            },

            dismissReward: () => set({ lastReward: null }),

            purchase: (id) => {
                const item = getItem(id);
                const state = get();
                if (!item) return 'locked';
                if (state.owned.includes(id)) return 'owned';
                if (item.requiresStars && useStickerStore.getState().stars < item.requiresStars) {
                    return 'locked';
                }
                const price = getPrice(item);
                if (state.carrots < price) return 'insufficient';

                set({ carrots: state.carrots - price, owned: [...state.owned, id] });
                return 'ok';
            },

            equipHat: (id) => set((state) => (state.owned.includes(id) ? { equippedHat: id } : state)),
            equipPaper: (id) => set((state) => (state.owned.includes(id) ? { equippedPaper: id } : state)),
            toggleDecor: (id) =>
                set((state) => {
                    if (!state.owned.includes(id)) return state;
                    return state.placedDecor.includes(id)
                        ? { placedDecor: state.placedDecor.filter((d) => d !== id) }
                        : { placedDecor: [...state.placedDecor, id] };
                }),
        }),
        {
            name: 'bunny-post-shop',
            // 데이터만 저장해요. (방금 받은 보상, 하이드레이션 여부, 함수는 저장하지 않아요)
            partialize: (state) => ({
                carrots: state.carrots,
                rewardedTodoIds: state.rewardedTodoIds,
                lastBonusDay: state.lastBonusDay,
                owned: state.owned,
                equippedHat: state.equippedHat,
                equippedPaper: state.equippedPaper,
                placedDecor: state.placedDecor,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);
