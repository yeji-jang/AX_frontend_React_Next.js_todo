'use server';

import { getCurrentUser } from '@/domains/auth/queries/getCurrentUser.query';
import { createServerClient } from '@/shared/lib/supabase';
import type { ActionState } from '@/shared/types/action.types';
import { revalidatePath } from 'next/cache';
import type { FoundProfile } from '../types/friend.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LOGIN_REQUIRED: ActionState = { success: false, message: '로그인이 필요한 서비스 입니다.' };

// DB 함수·테이블이 아직 없을 때(마이그레이션 SQL 미실행) 원인을 알려줘요
function friendlyDbError(error: { code?: string }, fallback: string): string {
    if (error.code === 'PGRST202' || error.code === 'PGRST205' || error.code === '42883' || error.code === '42P01') {
        return '친구 기능 DB가 아직 준비되지 않았어요. Supabase에서 마이그레이션 SQL을 먼저 실행해 주세요.';
    }
    return fallback;
}

// 이메일로 친구 찾기 (useActionState용)
export async function searchFriendAction(
    prevState: ActionState<FoundProfile | null>,
    formData: FormData,
): Promise<ActionState<FoundProfile | null>> {
    const email = ((formData.get('email') as string) ?? '').trim();

    const { user } = await getCurrentUser();
    if (!user) return LOGIN_REQUIRED as ActionState<null>;

    if (!EMAIL_PATTERN.test(email)) {
        return { success: false, errors: { email: '이메일 형식을 확인해 주세요.' } };
    }

    const supabase = createServerClient();
    const { data, error } = await supabase.rpc('find_profile_by_email', { p_email: email });

    if (error) {
        console.error('[find_profile_by_email]', error);
        return { success: false, message: friendlyDbError(error, '친구를 찾지 못했어요. 잠시 후 다시 시도해 주세요.') };
    }
    if (!data) {
        return { success: false, message: '그 이메일로 가입한 토끼를 찾지 못했어요.', data: null };
    }
    return { success: true, data: data as FoundProfile };
}

const REQUEST_MESSAGES: Record<string, ActionState> = {
    sent: { success: true, message: '친구 신청을 보냈어요! 💌' },
    accepted: { success: true, message: '서로 신청해서 바로 친구가 됐어요! 🎉' },
    already_friends: { success: false, message: '이미 친구예요.' },
    already_sent: { success: false, message: '이미 신청을 보냈어요. 수락을 기다려 주세요.' },
    self: { success: false, message: '나 자신에게는 신청할 수 없어요.' },
    not_found: { success: false, message: '사용자를 찾을 수 없어요.' },
};

// 친구 신청
export async function sendFriendRequestAction(userId: string): Promise<ActionState> {
    const { user } = await getCurrentUser();
    if (!user) return LOGIN_REQUIRED;

    const supabase = createServerClient();
    const { data, error } = await supabase.rpc('send_friend_request', { p_user_id: userId });

    if (error) {
        console.error('[send_friend_request]', error);
        return { success: false, message: friendlyDbError(error, '친구 신청에 실패했어요. 잠시 후 다시 시도해 주세요.') };
    }

    revalidatePath('/friends', 'page');
    return REQUEST_MESSAGES[data as string] ?? { success: false, message: '친구 신청에 실패했어요.' };
}

// 받은 신청 수락 / 거절
export async function respondFriendRequestAction(id: string, accept: boolean): Promise<ActionState> {
    const { user } = await getCurrentUser();
    if (!user) return LOGIN_REQUIRED;

    const supabase = createServerClient();
    const { data, error } = await supabase.rpc('respond_friend_request', { p_id: id, p_accept: accept });

    if (error || !data) {
        return { success: false, message: '처리하지 못했어요. 이미 취소된 신청일 수 있어요.' };
    }

    revalidatePath('/friends', 'page');
    return { success: true, message: accept ? '친구가 됐어요! 🎉' : '신청을 거절했어요.' };
}

// 친구 끊기 / 보낸 신청 취소
export async function removeFriendshipAction(id: string): Promise<ActionState> {
    const { user } = await getCurrentUser();
    if (!user) return LOGIN_REQUIRED;

    const supabase = createServerClient();
    const { data, error } = await supabase.rpc('remove_friendship', { p_id: id });

    if (error || !data) {
        return { success: false, message: '처리하지 못했어요. 잠시 후 다시 시도해 주세요.' };
    }

    revalidatePath('/friends', 'page');
    return { success: true };
}

// 방명록 남기기 (useActionState용)
export async function addGuestbookAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const ownerId = (formData.get('ownerId') as string) ?? '';
    const message = ((formData.get('message') as string) ?? '').trim();

    const { user } = await getCurrentUser();
    if (!user) return LOGIN_REQUIRED;

    if (message.length < 1 || message.length > 100) {
        return { success: false, errors: { message: '방명록은 1~100자로 남겨 주세요.' } };
    }

    const supabase = createServerClient();
    const { error } = await supabase.rpc('add_guestbook_entry', { p_owner_id: ownerId, p_message: message });

    if (error) {
        return { success: false, message: '방명록을 남기지 못했어요. 친구 마을에만 남길 수 있어요.' };
    }

    revalidatePath(`/village/${ownerId}`, 'page');
    return { success: true, message: '방명록을 남겼어요! 📮' };
}

// 방명록 지우기 (마을 주인 또는 쓴 사람)
export async function deleteGuestbookAction(id: string, ownerId: string): Promise<ActionState> {
    const { user } = await getCurrentUser();
    if (!user) return LOGIN_REQUIRED;

    const supabase = createServerClient();
    const { data, error } = await supabase.rpc('delete_guestbook_entry', { p_id: id });

    if (error || !data) {
        return { success: false, message: '방명록을 지우지 못했어요.' };
    }

    revalidatePath(`/village/${ownerId}`, 'page');
    return { success: true };
}
