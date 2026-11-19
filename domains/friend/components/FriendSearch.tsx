'use client';

import Link from 'next/link';
import { useActionState, useState, useTransition } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import type { ActionState } from '@/shared/types/action.types';
import { searchFriendAction, sendFriendRequestAction } from '../actions/friend.actions';
import type { FoundProfile } from '../types/friend.types';

const INITIAL: ActionState<FoundProfile | null> = { success: false };

// 이메일로 친구 찾기 → 친구 신청
export default function FriendSearch() {
    const [state, formAction, isSearching] = useActionState(searchFriendAction, INITIAL);
    const [isSending, startTransition] = useTransition();
    // 신청 결과 (검색 결과 id별로 기억해서, 다시 검색하면 사라져요)
    const [sent, setSent] = useState<{ userId: string; message: string; ok: boolean } | null>(null);

    const found = state.success ? state.data : null;
    const sentForFound = found && sent?.userId === found.userId ? sent : null;

    const sendRequest = (profile: FoundProfile) => {
        startTransition(async () => {
            const result = await sendFriendRequestAction(profile.userId);
            setSent({ userId: profile.userId, message: result.message ?? '', ok: result.success });
        });
    };

    return (
        <section className="paper-panel space-y-3 p-5 sm:p-6" aria-labelledby="friend-search-title">
            <h2 id="friend-search-title" className="font-cute text-xl text-[#65564B]">
                🔍 친구 찾기
            </h2>
            <p className="text-sm text-[#75655A]">친구가 가입할 때 쓴 이메일을 정확히 입력해 주세요.</p>

            <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
                <label htmlFor="friend-email" className="sr-only">
                    친구 이메일
                </label>
                <input
                    id="friend-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="off"
                    placeholder="friend@example.com"
                    className="form-input grow"
                    aria-invalid={!!state.errors?.email}
                    aria-describedby={state.errors?.email ? 'friend-email-error' : undefined}
                />
                <button type="submit" className="btn-bunny shrink-0" disabled={isSearching}>
                    {isSearching ? '찾는 중…' : '찾기'}
                </button>
            </form>

            {state.errors?.email && (
                <p id="friend-email-error" className="form-error">
                    <FiAlertCircle /> {state.errors.email}
                </p>
            )}
            {!state.success && state.message && (
                <p className="form-alert" role="status">
                    {state.message}
                </p>
            )}

            {found && (
                <div className="friend-row" aria-live="polite">
                    <span className="friend-row__avatar" aria-hidden>
                        🐰
                    </span>
                    <p className="font-cute min-w-0 grow truncate text-lg text-[#65564B]">{found.name}</p>
                    <FoundAction
                        profile={found}
                        sentMessage={sentForFound}
                        isSending={isSending}
                        onSend={() => sendRequest(found)}
                    />
                </div>
            )}
            {sentForFound && (
                <p className={sentForFound.ok ? 'text-sm text-[#3F6B2C]' : 'form-alert'} role="status">
                    {sentForFound.message}
                </p>
            )}
        </section>
    );
}

function FoundAction({
    profile,
    sentMessage,
    isSending,
    onSend,
}: {
    profile: FoundProfile;
    sentMessage: { ok: boolean } | null;
    isSending: boolean;
    onSend: () => void;
}) {
    if (profile.relation === 'self') return <span className="text-sm text-[#75655A]">나예요! 🙋</span>;
    if (profile.relation === 'friend') {
        return (
            <Link href={`/village/${profile.userId}`} className="pill-btn pill-btn--done">
                🏡 놀러가기
            </Link>
        );
    }
    if (profile.relation === 'sent' || sentMessage?.ok) {
        return <span className="text-sm text-[#75655A]">신청 보냄 · 기다리는 중</span>;
    }
    return (
        <button type="button" className="pill-btn pill-btn--done" disabled={isSending} onClick={onSend}>
            {isSending ? '보내는 중…' : profile.relation === 'received' ? '🤝 수락하기' : '💌 친구 신청'}
        </button>
    );
}
