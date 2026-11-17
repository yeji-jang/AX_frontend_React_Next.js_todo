'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** 별 스티커 개수에 따라 토끼의 모자가 바뀌어요. */
export const HAT_LEVELS = [
    { min: 0, name: '배달원 모자' },
    { min: 3, name: '꽃 장식 모자' },
    { min: 7, name: '밀짚 모자' },
] as const;

export type HatTier = 0 | 1 | 2;

export function getHatTier(stars: number): HatTier {
    if (stars >= HAT_LEVELS[2].min) return 2;
    if (stars >= HAT_LEVELS[1].min) return 1;
    return 0;
}

/** 다음 모자까지 남은 스티커 수 (마지막 모자면 null) */
export function getStarsToNextHat(stars: number): number | null {
    const next = HAT_LEVELS.find((level) => level.min > stars);
    return next ? next.min - stars : null;
}

// 할 일을 완료할 때마다 받는 별 스티커 (브라우저에 저장)
interface StickerStore {
    stars: number;
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
    addStar: () => void;
}

export const useStickerStore = create<StickerStore>()(
    persist(
        (set) => ({
            stars: 0,
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),
            addStar: () => set((state) => ({ stars: state.stars + 1 })),
        }),
        {
            name: 'bunny-post-stickers',
            partialize: (state) => ({ stars: state.stars }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);
