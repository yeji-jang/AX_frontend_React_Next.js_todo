'use client';

import { MotionConfig, motion } from 'motion/react';
import { useState } from 'react';
import BunnyCharacter from '@/domains/todo/components/bunny/BunnyCharacter';
import BunnySpeechBubble from '@/domains/todo/components/bunny/BunnySpeechBubble';
import Mailbox from '@/domains/todo/components/meadow/Mailbox';
import MeadowBackground from '@/domains/todo/components/meadow/MeadowBackground';
import { useDayPeriod } from '@/shared/hooks/useDayPeriod';
import type { VillageVisit } from '../types/friend.types';

/** 구름 위에 보여줄 봉투 개수 (너무 많으면 +N으로) */
const MAX_LETTERS = 6;

function getGreetings(visit: VillageVisit): string[] {
    if (visit.isMe) {
        return ['내 마을이에요! 친구들이 남긴 방명록을 읽어 봐요.', '오늘도 마을을 예쁘게 꾸며 볼까요?'];
    }
    const lines = [`${visit.name}님 마을에 놀러 온 걸 환영해요! 🐰`, '천천히 구경하고 가요~', '방명록에 한마디 남겨 줄래요?'];
    if (visit.activeCount > 0) lines.push(`요즘 편지를 ${visit.activeCount}통이나 배달하고 있어요. 응원해 줘요!`);
    if (visit.doneCount > 0) lines.push(`벌써 할 일을 ${visit.doneCount}개나 끝냈대요! 대단하죠?`);
    if (visit.decor.length > 0) lines.push('마을 꾸민 거 봤어요? 잡화점에서 하나씩 모았대요!');
    return lines;
}

/**
 * 친구(또는 내) 마을 구경하기
 * 토끼 · 모자 · 마을 소품 · 편지지는 그대로 보여주고, 할 일은 봉인된 편지 개수로만 보여줘요.
 */
export default function FriendVillage({ visit }: { visit: VillageVisit }) {
    const period = useDayPeriod();
    const greetings = getGreetings(visit);
    const [lineIndex, setLineIndex] = useState(0);

    const letters = Math.min(visit.activeCount, MAX_LETTERS);
    const extra = visit.activeCount - letters;

    return (
        <MotionConfig reducedMotion="user">
            <MeadowBackground
                period={period}
                decor={visit.decor}
                stage={
                    <>
                        <div className="spot-mailbox absolute">
                            <Mailbox letters={visit.activeCount} className="relative" />
                        </div>
                        <div className="spot-bunny absolute">
                            <button
                                type="button"
                                className="block w-full cursor-pointer rounded-full outline-offset-4"
                                onClick={() => setLineIndex((i) => (i + 1) % greetings.length)}
                                aria-label={`${visit.name}님의 토끼에게 말 걸기`}
                            >
                                <BunnyCharacter expression="happy" hat={visit.hat} waving className="h-auto w-full" />
                            </button>
                        </div>
                        <BunnySpeechBubble
                            className="spot-bunny-bubble absolute z-30"
                            message={<p className="font-cute text-base">{greetings[lineIndex]}</p>}
                            messageKey={`visit-${lineIndex}`}
                        />
                    </>
                }
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="village-nameplate font-cute">
                        🏡 {visit.isMe ? '내 마을' : `${visit.name}님의 마을`}
                    </h1>
                    <ul className="flex flex-wrap gap-2" aria-label="마을 현황">
                        <li className="stat-chip">📬 배달 중 <strong>{visit.activeCount}</strong></li>
                        <li className="stat-chip">✅ 완료 <strong>{visit.doneCount}</strong></li>
                        <li className="stat-chip">⭐ 별 <strong>{visit.stars}</strong></li>
                    </ul>
                </div>

                {/* 할 일은 내용 없이 봉인된 편지로만 보여줘요. */}
                {visit.activeCount === 0 ? (
                    <div className="mx-auto my-6 max-w-sm text-center">
                        <div className="empty-cloud">
                            <p className="font-cute text-lg text-[#65564B]">☁️ 지금은 배달할 편지가 없어요. 여유로운 하루!</p>
                        </div>
                    </div>
                ) : (
                    <ul className="flex flex-wrap justify-center gap-x-6 gap-y-8 pb-4 pt-8" aria-label={`배달 중인 편지 ${visit.activeCount}통`}>
                        {Array.from({ length: letters }, (_, i) => (
                            <motion.li
                                key={i}
                                className="relative list-none"
                                initial={{ opacity: 0, y: 16, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: i * 0.08, type: 'spring', stiffness: 220, damping: 16 }}
                                aria-hidden
                            >
                                <div className="cloud-base" data-variant={i % 3} style={{ animationDelay: `${-i * 1.1}s` }} />
                                <div className="memo-card sealed-letter" data-paper={visit.paper} style={{ rotate: `${((i % 3) - 1) * 3}deg` }}>
                                    <span className="sealed-letter__seal">♥</span>
                                </div>
                            </motion.li>
                        ))}
                        {extra > 0 && (
                            <li className="font-cute self-center text-lg text-[#65564B]">+{extra}통</li>
                        )}
                    </ul>
                )}
            </MeadowBackground>
        </MotionConfig>
    );
}
