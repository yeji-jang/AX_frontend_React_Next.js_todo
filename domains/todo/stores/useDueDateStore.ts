'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 할 일의 마감일을 브라우저(localStorage)에 저장하는 스토어
// 기존 Supabase todos 테이블 구조를 바꾸지 않기 위해 찜목록(usePinStore)과 같은 방식을 사용합니다.
// → 같은 브라우저에서는 유지되지만, 다른 기기에서는 마감일이 보이지 않아요.
interface DueDateStore {
    /** { [할 일 id]: 'YYYY-MM-DD' } */
    dueDates: Record<string, string>;
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
    setDueDate: (id: string, date: string) => void;
    removeDueDate: (id: string) => void;
}

export const useDueDateStore = create<DueDateStore>()(
    persist(
        (set) => ({
            dueDates: {},
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),
            setDueDate: (id, date) =>
                set((state) => ({ dueDates: { ...state.dueDates, [id]: date } })),
            removeDueDate: (id) =>
                set((state) => {
                    const next = { ...state.dueDates };
                    delete next[id];
                    return { dueDates: next };
                }),
        }),
        {
            name: 'bunny-post-due-dates',
            partialize: (state) => ({ dueDates: state.dueDates }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);
