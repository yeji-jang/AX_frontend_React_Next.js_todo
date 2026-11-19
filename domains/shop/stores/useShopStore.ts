'use client';

import { create } from 'zustand';
import { supabase } from '@/shared/lib/supabase';
import { DEFAULT_HAT, DEFAULT_PAPER, STARTER_ITEMS } from '../constants/shopCatalog';
import type { DecorId, HatId, ItemId, PaperId, PurchaseResult, RewardReceipt } from '../types/shop.types';
import { todayKey } from '../utils/carrotRules';
import { clearLegacyVillage, readLegacyVillage } from '../utils/legacyVillage';

/** DB villages 테이블 한 줄 */
interface VillageRow {
    carrots: number;
    stars: number;
    owned: string[];
    equipped_hat: string;
    equipped_paper: string;
    placed_decor: string[];
    imported_local: boolean;
}

interface ClaimResponse {
    repeat: boolean;
    base?: number;
    onTime?: number;
    daily?: number;
    total?: number;
    carrots: number;
    stars: number;
}

/**
 * 내 마을(당근 지갑 + 별 + 가방 + 꾸미기) 스토어
 *
 * 친구가 내 마을에 놀러 올 수 있도록 데이터는 Supabase(villages 테이블)에 저장해요.
 * 당근 지급 · 구매 · 꾸미기는 모두 DB 함수(rpc)가 검사한 뒤 처리하고,
 * 이 스토어는 서버가 돌려준 최신 값을 화면에 보여 주는 역할만 해요.
 */
interface ShopStore {
    status: 'idle' | 'loading' | 'ready' | 'error';
    /** DB 테이블·함수가 아직 없어요 (마이그레이션 SQL을 실행해야 해요) */
    needsSetup: boolean;
    /** 서버에서 내 마을을 불러왔는지 (불러오기 전에는 기본 모습으로 그려요) */
    _hasHydrated: boolean;
    /** 지금 불러온 마을의 주인 (다른 계정으로 바뀌면 다시 불러와요) */
    userId: string | null;

    carrots: number;
    stars: number;
    owned: ItemId[];
    equippedHat: HatId;
    equippedPaper: PaperId;
    placedDecor: DecorId[];

    /** 방금 받은 보상 (화면에 영수증을 띄울 때 사용) */
    lastReward: RewardReceipt | null;

    load: (userId: string) => Promise<void>;
    reset: () => void;
    /** 할 일 완료 보상 받기 (처음 완료한 할 일만 당근을 받아요) */
    claimReward: (todo: { id: string; title: string; daysLeft: number | null }) => Promise<void>;
    dismissReward: () => void;
    purchase: (id: ItemId) => Promise<PurchaseResult>;
    equipHat: (id: HatId) => void;
    equipPaper: (id: PaperId) => void;
    toggleDecor: (id: DecorId) => void;
}

const EMPTY = {
    carrots: 0,
    stars: 0,
    owned: [...STARTER_ITEMS],
    equippedHat: DEFAULT_HAT,
    equippedPaper: DEFAULT_PAPER,
    placedDecor: [] as DecorId[],
};

function fromRow(row: VillageRow) {
    return {
        carrots: row.carrots,
        stars: row.stars,
        owned: row.owned as ItemId[],
        equippedHat: row.equipped_hat as HatId,
        equippedPaper: row.equipped_paper as PaperId,
        placedDecor: row.placed_decor as DecorId[],
    };
}

let receiptKey = 0;
/** 늦게 도착한 이전 계정의 응답을 무시하기 위한 번호 */
let loadSeq = 0;

export const useShopStore = create<ShopStore>()((set, get) => {
    /** 모자 · 편지지 · 소품 저장: 화면을 먼저 바꾸고, 실패하면 원래대로 돌려요. */
    const saveLook = async (prev: Pick<ShopStore, 'equippedHat' | 'equippedPaper' | 'placedDecor'>) => {
        const { equippedHat, equippedPaper, placedDecor } = get();
        const { data, error } = await supabase.rpc('set_village_look', {
            p_hat: equippedHat,
            p_paper: equippedPaper,
            p_decor: placedDecor,
        });
        if (error || !data) {
            console.error('마을 꾸미기 저장 실패:', error?.message);
            set(prev);
            return;
        }
        set(fromRow(data as VillageRow));
    };

    return {
        status: 'idle',
        needsSetup: false,
        _hasHydrated: false,
        userId: null,
        ...EMPTY,
        lastReward: null,

        load: async (userId) => {
            const seq = ++loadSeq;
            // 다른 계정으로 바뀌었으면 이전 계정의 마을을 바로 지워요.
            if (get().userId !== userId) {
                set({ ...EMPTY, userId, _hasHydrated: false, lastReward: null });
            }
            set({ status: 'loading' });

            const { data, error } = await supabase.rpc('ensure_my_village');
            if (seq !== loadSeq) return;
            if (error || !data) {
                const needsSetup = error?.code === 'PGRST202' || error?.code === 'PGRST205';
                if (needsSetup) {
                    console.warn(
                        '마을 DB가 아직 없어요. supabase/migrations/20261118_village_friends.sql 을 Supabase SQL Editor에서 실행해 주세요.',
                    );
                } else {
                    console.error('마을을 불러오지 못했어요:', error?.message);
                }
                set({ status: 'error', needsSetup });
                return;
            }

            let row = data as VillageRow;

            // 예전에 이 브라우저에 모아 둔 당근 · 물건이 있으면 한 번만 서버로 옮겨요.
            if (!row.imported_local) {
                const legacy = readLegacyVillage();
                const { data: imported, error: importError } = await supabase.rpc('import_local_village', {
                    p_carrots: legacy.carrots,
                    p_stars: legacy.stars,
                    p_owned: legacy.owned,
                    p_hat: legacy.equippedHat,
                    p_paper: legacy.equippedPaper,
                    p_decor: legacy.placedDecor,
                });
                if (seq !== loadSeq) return;
                if (!importError && imported) {
                    row = imported as VillageRow;
                    clearLegacyVillage();
                }
            }

            set({ ...fromRow(row), status: 'ready', needsSetup: false, _hasHydrated: true });
        },

        reset: () => {
            loadSeq++;
            set({ ...EMPTY, status: 'idle', _hasHydrated: false, userId: null, lastReward: null });
        },

        claimReward: async ({ id, title, daysLeft }) => {
            const { data, error } = await supabase.rpc('claim_todo_reward', {
                p_todo_id: id,
                p_on_time: daysLeft !== null && daysLeft >= 0,
                p_today: todayKey(),
            });
            if (error || !data) {
                console.error('보상을 받지 못했어요:', error?.message);
                return;
            }

            const res = data as ClaimResponse;
            const lines = res.repeat
                ? []
                : [
                      { label: '배달 완료', amount: res.base ?? 0 },
                      { label: '마감 전 완료', amount: res.onTime ?? 0 },
                      { label: '오늘의 첫 완료', amount: res.daily ?? 0 },
                  ].filter((line) => line.amount > 0);

            set({
                carrots: res.carrots,
                stars: res.stars,
                lastReward: { key: ++receiptKey, title, total: res.total ?? 0, lines, repeat: res.repeat },
            });
        },

        dismissReward: () => set({ lastReward: null }),

        purchase: async (id) => {
            const { data, error } = await supabase.rpc('buy_shop_item', { p_item_id: id, p_today: todayKey() });
            if (error || !data) {
                console.error('구매 실패:', error?.message);
                return 'error';
            }
            const res = data as { result: PurchaseResult; carrots: number; owned: string[] };
            set({ carrots: res.carrots, owned: res.owned as ItemId[] });
            return res.result;
        },

        equipHat: (id) => {
            const state = get();
            if (!state.owned.includes(id) || state.equippedHat === id) return;
            const prev = { equippedHat: state.equippedHat, equippedPaper: state.equippedPaper, placedDecor: state.placedDecor };
            set({ equippedHat: id });
            void saveLook(prev);
        },

        equipPaper: (id) => {
            const state = get();
            if (!state.owned.includes(id) || state.equippedPaper === id) return;
            const prev = { equippedHat: state.equippedHat, equippedPaper: state.equippedPaper, placedDecor: state.placedDecor };
            set({ equippedPaper: id });
            void saveLook(prev);
        },

        toggleDecor: (id) => {
            const state = get();
            if (!state.owned.includes(id)) return;
            const prev = { equippedHat: state.equippedHat, equippedPaper: state.equippedPaper, placedDecor: state.placedDecor };
            set({
                placedDecor: state.placedDecor.includes(id)
                    ? state.placedDecor.filter((d) => d !== id)
                    : [...state.placedDecor, id],
            });
            void saveLook(prev);
        },
    };
});
