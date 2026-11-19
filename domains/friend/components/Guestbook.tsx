'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useActionState, useEffect, useRef, useTransition } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { INITIAL_ACTION_STATE } from '@/shared/types/action.types';
import { addGuestbookAction, deleteGuestbookAction } from '../actions/friend.actions';
import type { GuestbookEntry } from '../types/friend.types';

interface GuestbookProps {
    ownerId: string;
    /** 지금 보고 있는 사람 (내가 쓴 글 · 내 마을 글은 지울 수 있어요) */
    viewerId: string;
    isMe: boolean;
    entries: GuestbookEntry[];
}

const NOTE_COLORS = ['#FFF4C9', '#FFE3EA', '#D6F1E4', '#E6F3FB', '#EFEAFC'];

// 서버와 브라우저에서 같은 결과가 나오도록 시간대를 고정해요. (하이드레이션 오류 방지)
const DATE_FORMAT = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric' });
const formatDate = (iso: string) => DATE_FORMAT.format(new Date(iso));

// 방명록: 친구 마을에는 글을 남기고, 내 마을에서는 친구들이 남긴 글을 읽어요.
export default function Guestbook({ ownerId, viewerId, isMe, entries }: GuestbookProps) {
    const [state, formAction, isSubmitting] = useActionState(addGuestbookAction, INITIAL_ACTION_STATE);
    const [isDeleting, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    // 글을 남기면 입력칸을 비워요.
    useEffect(() => {
        if (state.success) formRef.current?.reset();
    }, [state]);

    return (
        <section className="paper-panel space-y-4 p-5 sm:p-6" aria-labelledby="guestbook-title">
            <h2 id="guestbook-title" className="font-cute text-xl text-[#65564B]">
                📖 방명록 <span className="text-base text-[#75655A]">{entries.length}</span>
            </h2>

            {!isMe && (
                <form ref={formRef} action={formAction} className="space-y-2">
                    <input type="hidden" name="ownerId" value={ownerId} />
                    <label htmlFor="guestbook-message" className="sr-only">
                        방명록 남기기
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                            id="guestbook-message"
                            name="message"
                            maxLength={100}
                            required
                            autoComplete="off"
                            placeholder="놀러 왔어요! 한마디 남겨 주세요 (100자까지)"
                            className="form-input grow"
                        />
                        <button type="submit" className="btn-bunny shrink-0" disabled={isSubmitting}>
                            {isSubmitting ? '남기는 중…' : '📮 남기기'}
                        </button>
                    </div>
                    {state.errors?.message && (
                        <p className="form-error">
                            <FiAlertCircle /> {state.errors.message}
                        </p>
                    )}
                    {!state.success && state.message && <p className="form-alert">{state.message}</p>}
                </form>
            )}

            {entries.length === 0 ? (
                <p className="text-sm text-[#75655A]">
                    {isMe ? '아직 방명록이 비어 있어요. 친구를 초대해 보세요!' : '첫 번째 방명록을 남겨 보세요!'}
                </p>
            ) : (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <AnimatePresence initial={false}>
                        {entries.map((entry, i) => {
                            const canDelete = isMe || entry.authorId === viewerId;
                            return (
                                <motion.li
                                    key={entry.id}
                                    layout
                                    className="guest-note"
                                    style={{ background: NOTE_COLORS[i % NOTE_COLORS.length], rotate: `${((i % 3) - 1) * 1.2}deg` }}
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.85 }}
                                >
                                    <p className="break-all text-[15px] leading-relaxed text-[#65564B]">{entry.message}</p>
                                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[#75655A]">
                                        <span className="font-cute text-sm">🐰 {entry.authorName}</span>
                                        <span className="flex items-center gap-2">
                                            {formatDate(entry.createdAt)}
                                            {canDelete && (
                                                <button
                                                    type="button"
                                                    className="underline-offset-2 hover:underline"
                                                    disabled={isDeleting}
                                                    onClick={() => {
                                                        if (confirm('이 방명록을 지울까요?')) {
                                                            startTransition(async () => {
                                                                await deleteGuestbookAction(entry.id, ownerId);
                                                            });
                                                        }
                                                    }}
                                                >
                                                    지우기
                                                </button>
                                            )}
                                        </span>
                                    </div>
                                </motion.li>
                            );
                        })}
                    </AnimatePresence>
                </ul>
            )}
        </section>
    );
}
