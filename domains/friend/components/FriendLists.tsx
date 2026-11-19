'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import BunnyCharacter from '@/domains/todo/components/bunny/BunnyCharacter';
import { removeFriendshipAction, respondFriendRequestAction } from '../actions/friend.actions';
import type { FriendOverview, FriendRequest } from '../types/friend.types';

// 받은 신청 · 친구 목록 · 보낸 신청
// 버튼을 누르면 Server Action이 처리하고 revalidatePath로 목록이 새로 그려져요.
export default function FriendLists({ overview }: { overview: FriendOverview }) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const run = (action: () => Promise<{ success: boolean; message?: string }>) => {
        setError(null);
        startTransition(async () => {
            const result = await action();
            if (!result.success) setError(result.message ?? '처리하지 못했어요.');
        });
    };

    const { friends, received, sent } = overview;

    return (
        <div className="space-y-5">
            {error && (
                <p className="form-alert" role="alert">
                    {error}
                </p>
            )}

            {received.length > 0 && (
                <section className="paper-panel space-y-3 p-5 sm:p-6" aria-labelledby="received-title">
                    <h2 id="received-title" className="font-cute text-xl text-[#65564B]">
                        📬 받은 친구 신청 <span className="text-base text-[#E07A2B]">{received.length}</span>
                    </h2>
                    <ul className="space-y-2">
                        {received.map((req) => (
                            <RequestRow key={req.id} request={req}>
                                <button
                                    type="button"
                                    className="pill-btn pill-btn--done"
                                    disabled={isPending}
                                    onClick={() => run(() => respondFriendRequestAction(req.id, true))}
                                >
                                    수락
                                </button>
                                <button
                                    type="button"
                                    className="pill-btn pill-btn--ghost"
                                    disabled={isPending}
                                    onClick={() => run(() => respondFriendRequestAction(req.id, false))}
                                >
                                    거절
                                </button>
                            </RequestRow>
                        ))}
                    </ul>
                </section>
            )}

            <section className="paper-panel space-y-3 p-5 sm:p-6" aria-labelledby="friends-title">
                <h2 id="friends-title" className="font-cute text-xl text-[#65564B]">
                    🐰 내 친구 <span className="text-base text-[#75655A]">{friends.length}</span>
                </h2>
                {friends.length === 0 ? (
                    <p className="text-sm text-[#75655A]">아직 친구가 없어요. 위에서 이메일로 친구를 찾아보세요!</p>
                ) : (
                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {friends.map((friend) => (
                            <li key={friend.id} className="friend-card">
                                <div className="w-[64px] shrink-0">
                                    <BunnyCharacter expression="happy" hat={friend.hat} className="h-auto w-full" />
                                </div>
                                <div className="min-w-0 grow">
                                    <p className="font-cute truncate text-lg text-[#65564B]">{friend.name}</p>
                                    <p className="text-xs text-[#75655A]">⭐ 별 {friend.stars}</p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        <Link href={`/village/${friend.userId}`} className="pill-btn pill-btn--done">
                                            🏡 놀러가기
                                        </Link>
                                        <button
                                            type="button"
                                            className="pill-btn pill-btn--ghost"
                                            disabled={isPending}
                                            onClick={() => {
                                                if (confirm(`${friend.name}님과 친구를 끊을까요?`)) {
                                                    run(() => removeFriendshipAction(friend.id));
                                                }
                                            }}
                                        >
                                            친구 끊기
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {sent.length > 0 && (
                <section className="paper-panel space-y-3 p-5 sm:p-6" aria-labelledby="sent-title">
                    <h2 id="sent-title" className="font-cute text-lg text-[#65564B]">
                        ✉️ 보낸 신청
                    </h2>
                    <ul className="space-y-2">
                        {sent.map((req) => (
                            <RequestRow key={req.id} request={req} note="수락을 기다리는 중">
                                <button
                                    type="button"
                                    className="pill-btn pill-btn--ghost"
                                    disabled={isPending}
                                    onClick={() => run(() => removeFriendshipAction(req.id))}
                                >
                                    취소
                                </button>
                            </RequestRow>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}

function RequestRow({
    request,
    note,
    children,
}: {
    request: FriendRequest;
    note?: string;
    children: React.ReactNode;
}) {
    return (
        <li className="friend-row">
            <span className="friend-row__avatar" aria-hidden>
                🐰
            </span>
            <div className="min-w-0 grow">
                <p className="font-cute truncate text-base text-[#65564B]">{request.name}</p>
                {note && <p className="text-xs text-[#75655A]">{note}</p>}
            </div>
            <div className="flex shrink-0 gap-1.5">{children}</div>
        </li>
    );
}
