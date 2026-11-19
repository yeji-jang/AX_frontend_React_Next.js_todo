// 서버 컴포넌트에서만 사용하는 조회 함수입니다.
// 친구 관계 확인은 DB 함수(get_friend_overview, get_village_visit)가 해요.

import { createServerClient } from '@/shared/lib/supabase';
import type { FriendOverview, VillageVisit } from '../types/friend.types';

const EMPTY_OVERVIEW: FriendOverview = { friends: [], received: [], sent: [] };

/** 친구 목록 · 받은 신청 · 보낸 신청 */
export async function getFriendOverview(): Promise<FriendOverview> {
    const supabase = createServerClient();
    const { data, error } = await supabase.rpc('get_friend_overview');

    if (error) {
        console.error('친구 목록을 불러오지 못했습니다.', error.message);
        throw new Error('친구 목록을 불러오지 못했습니다.');
    }
    return (data as FriendOverview | null) ?? EMPTY_OVERVIEW;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 마을 구경하기 (내 마을 또는 친구 마을만)
 * 친구가 아니거나 없는 사용자면 null → 페이지에서 notFound() 처리
 */
export async function getVillageVisit(userId: string): Promise<VillageVisit | null> {
    if (!UUID_PATTERN.test(userId)) return null;

    const supabase = createServerClient();
    const { data, error } = await supabase.rpc('get_village_visit', { p_user_id: userId });

    if (error) {
        console.error('마을을 불러오지 못했습니다.', error.message);
        throw new Error('마을을 불러오지 못했습니다.');
    }
    return (data as VillageVisit | null) ?? null;
}
