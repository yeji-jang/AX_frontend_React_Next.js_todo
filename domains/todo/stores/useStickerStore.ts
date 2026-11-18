'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 할 일을 처음 완료할 때마다 받는 별 스티커 (브라우저에 저장)
// 별을 모으면 잡화점에서 특별한 모자를 받을 수 있어요. (shopCatalog의 requiresStars)
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
