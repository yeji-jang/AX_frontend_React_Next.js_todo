'use client';

import { create } from 'zustand';
import type { BunnyTalk, Celebration, Parcel } from '../types/bunny';

// 토끼에게 일어나는 "사건"을 모아 두는 스토어
// (Todo 데이터와 분리해서, 할 일이 바뀌어도 진행 중인 애니메이션이 꼬이지 않게 합니다.)
// 새로고침하면 사라져도 되는 값이라 persist는 쓰지 않습니다.
interface BunnyStore {
    /** 배달 대기열: 여러 개를 빠르게 등록해도 하나씩 순서대로 배달해요. */
    deliveryQueue: Parcel[];
    enqueueDelivery: (parcel: Parcel) => void;
    completeDelivery: (id: string) => void;

    /** 완료 축하 */
    celebration: Celebration | null;
    celebrate: (id: string, title: string) => void;
    endCelebration: () => void;
    /** 서버 저장에 실패하면 축하를 취소해요. */
    cancelCelebration: (id: string) => void;

    /** 토끼의 말 */
    talk: BunnyTalk | null;
    say: (text: string) => void;
    hush: () => void;

    /** 같은 긴급 알림을 여러 번 띄우지 않기 위한 기록 */
    shownUrgentToastKey: string | null;
    markUrgentToastShown: (key: string) => void;
}

let eventKey = 0;

export const useBunnyStore = create<BunnyStore>()((set) => ({
    deliveryQueue: [],
    enqueueDelivery: (parcel) =>
        set((state) =>
            state.deliveryQueue.some((p) => p.id === parcel.id)
                ? state
                : { deliveryQueue: [...state.deliveryQueue, parcel] },
        ),
    completeDelivery: (id) =>
        set((state) => ({
            deliveryQueue: state.deliveryQueue.filter((p) => p.id !== id),
        })),

    celebration: null,
    celebrate: (id, title) => set({ celebration: { id, title, key: ++eventKey } }),
    endCelebration: () => set({ celebration: null }),
    cancelCelebration: (id) =>
        set((state) => (state.celebration?.id === id ? { celebration: null } : state)),

    talk: null,
    say: (text) => set({ talk: { text, key: ++eventKey } }),
    hush: () => set({ talk: null }),

    shownUrgentToastKey: null,
    markUrgentToastShown: (key) => set({ shownUrgentToastKey: key }),
}));
