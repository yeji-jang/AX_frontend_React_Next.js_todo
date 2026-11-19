'use client';

import { useEffect } from 'react';
import { useShopStore } from '../stores/useShopStore';

/**
 * 로그인한 사용자의 마을(당근 · 물건)을 서버에서 불러와요.
 * 헤더에 들어 있어서 어느 페이지로 들어와도 한 번 실행되고,
 * 로그아웃하거나 다른 계정으로 바뀌면 다시 불러와요.
 */
export default function VillageSync({ userId }: { userId: string | null }) {
    const load = useShopStore((state) => state.load);
    const reset = useShopStore((state) => state.reset);

    useEffect(() => {
        if (userId) void load(userId);
        else reset();
    }, [userId, load, reset]);

    return null;
}
