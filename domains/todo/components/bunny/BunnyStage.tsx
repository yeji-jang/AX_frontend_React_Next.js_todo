'use client';

import { useAnimate, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useBunnyStore } from '../../stores/useBunnyStore';
import type { HatTier } from '../../stores/useStickerStore';
import type {
    BunnyExpression,
    BunnyHolding,
    BunnyMode,
    BunnyTalk,
    Celebration,
    DeliveryStep,
    Parcel,
    PrioritizedTodo,
} from '../../types/bunny';
import { getUrgentHeadline } from '../../utils/deadlineUtils';
import Mailbox from '../meadow/Mailbox';
import BunnyCharacter from './BunnyCharacter';
import BunnyDeliveryAnimation from './BunnyDeliveryAnimation';
import BunnySpeechBubble, { type BubbleTone } from './BunnySpeechBubble';
import BunnyUrgentAnimation, { type NewspaperBurst } from './BunnyUrgentAnimation';
import {
    type Actor,
    returnHome,
    runCelebrate,
    runDelivery,
    runTalk,
    runUrgent,
    wait,
} from './bunnySequences';

/** 연출 실행 번호 (신문 효과의 key를 겹치지 않게 만들 때 사용) */
let runSeed = 0;

interface BunnyStageProps {
    mode: BunnyMode;
    parcel: Parcel | null;
    celebration: Celebration | null;
    talk: BunnyTalk | null;
    /** 평소 표정 */
    expression: BunnyExpression;
    hatTier: HatTier;
    /** 가장 급한 할 일 (긴급 알림 문구용) */
    urgentTop?: PrioritizedTodo;
    /** 준비중인 할 일 수 (우체통 위 편지) */
    letters: number;
    /** 할 일이 하나도 없는지 */
    isEmpty: boolean;
    onUrgentEnd: () => void;
    onBunnyClick: () => void;
}

/**
 * 들판 위 토끼 무대: 우체통 + 토끼 + 말풍선 + 신문/편지 효과
 * 토끼의 상태(mode)가 바뀌면 그에 맞는 연출을 "한 번" 실행하고,
 * 끝나면 스토어에 알려서 다음 상태로 넘어가요.
 */
export default function BunnyStage({
    mode,
    parcel,
    celebration,
    talk,
    expression,
    hatTier,
    urgentTop,
    letters,
    isEmpty,
    onUrgentEnd,
    onBunnyClick,
}: BunnyStageProps) {
    const [scope, animate] = useAnimate<HTMLDivElement>();
    const mailboxRef = useRef<HTMLDivElement>(null);
    const anchorRef = useRef<HTMLDivElement>(null);
    const reduceMotion = useReducedMotion();

    const completeDelivery = useBunnyStore((state) => state.completeDelivery);
    const endCelebration = useBunnyStore((state) => state.endCelebration);

    // 배달 단계 (어떤 택배의 단계인지 id와 함께 기록)
    const [delivery, setDelivery] = useState<{ id: string; step: DeliveryStep } | null>(null);
    const [bursts, setBursts] = useState<NewspaperBurst[]>([]);

    const xRef = useRef(0);

    // 지금 상태에 해당하는 사건만 연출을 다시 시작하게 해요.
    // (예: 배달 중에 완료 축하가 생겨도 배달 연출이 처음부터 다시 시작되지 않아요.)
    const parcelId = mode === 'delivering' ? parcel?.id : undefined;
    const celebrationKey = mode === 'celebrating' ? celebration?.key : undefined;
    const talkKey = mode === 'talking' ? talk?.key : undefined;

    // ── 상태가 바뀌면 연출 실행 ──
    useEffect(() => {
        const el = scope.current;
        if (!el) return;

        // 상태가 바뀌면 cancelled = true → 진행 중이던 연출은 다음 단계로 넘어가지 않아요.
        let cancelled = false;
        const run = ++runSeed;
        const actor: Actor = {
            animate,
            el,
            alive: () => !cancelled,
            x: xRef.current,
        };

        const perform = async () => {
            try {
                if (mode === 'delivering' && parcelId) {
                    const onStep = (step: DeliveryStep) => {
                        if (actor.alive()) setDelivery({ id: parcelId, step });
                    };
                    if (reduceMotion) {
                        onStep('toss');
                        await wait(700);
                    } else {
                        // 우체통이 토끼 기본 위치에서 얼마나 떨어져 있는지 측정
                        const mailbox = mailboxRef.current?.getBoundingClientRect();
                        const home = anchorRef.current?.getBoundingClientRect();
                        const fromX =
                            mailbox && home
                                ? mailbox.left + mailbox.width / 2 - (home.left + home.width / 2)
                                : -80;
                        await runDelivery(actor, { fromX, onStep });
                    }
                    // 배달 완료 → 편지가 구름 위 카드로 변신
                    if (actor.alive()) completeDelivery(parcelId);
                    return;
                }

                if (mode === 'urgent') {
                    setBursts([]);
                    if (reduceMotion) {
                        await wait(2500);
                    } else {
                        const width = anchorRef.current?.parentElement?.clientWidth ?? 600;
                        let count = 0;
                        await actor.animate(el, { opacity: 1 }, { duration: 0.2 });
                        await runUrgent(actor, {
                            width,
                            onBurst: (x) => {
                                if (actor.alive()) {
                                    setBursts((prev) => [...prev, { key: run * 10 + count++, x }]);
                                }
                            },
                        });
                    }
                    if (actor.alive()) onUrgentEnd();
                    return;
                }

                if (mode === 'celebrating') {
                    if (reduceMotion) await wait(1500);
                    else await runCelebrate(actor);
                    if (actor.alive()) endCelebration();
                    return;
                }

                if (mode === 'talking' && !reduceMotion) {
                    await runTalk(actor);
                    return;
                }

                await returnHome(actor, mode !== 'sleeping');
            } finally {
                xRef.current = actor.x;
            }
        };

        void perform();
        // 클린업: 상태가 바뀌면 진행 중이던 연출을 무효화해요.
        return () => {
            cancelled = true;
        };
    }, [mode, parcelId, celebrationKey, talkKey, animate, scope, reduceMotion, completeDelivery, endCelebration, onUrgentEnd]);

    // ── 화면에 보여줄 것 계산 ──
    const step =
        mode === 'delivering' && delivery && delivery.id === parcelId ? delivery.step : null;

    let face: BunnyExpression = expression;
    let holding: BunnyHolding = 'none';
    if (mode === 'delivering') {
        face = step === 'hop' ? 'happy' : 'excited';
        holding = step === 'toss' ? 'none' : 'letter';
    } else if (mode === 'urgent') {
        face = 'worried';
        holding = 'newspaper';
    } else if (mode === 'celebrating') {
        face = 'excited';
    } else if (mode === 'talking') {
        face = 'happy';
    }

    const busy = mode === 'delivering' || mode === 'urgent' || mode === 'celebrating';
    const hidden = mode === 'sleeping';

    const bubble = getBubble({ mode, step, parcel, urgentTop, talk, isEmpty });
    const headline = urgentTop?.daysLeft != null ? getUrgentHeadline(urgentTop.daysLeft) : '서둘러요!';

    return (
        <>
            <div ref={mailboxRef} className="spot-mailbox absolute">
                <Mailbox open={step === 'emerge'} letters={letters} className="relative" />
            </div>

            <div ref={anchorRef} className="spot-bunny absolute">
                {mode === 'urgent' && <BunnyUrgentAnimation bursts={bursts} headline={headline} />}

                {mode === 'delivering' && step === 'toss' && parcel && (
                    <div className="absolute bottom-[78%] left-1/2 z-30 -translate-x-1/2">
                        <BunnyDeliveryAnimation parcel={parcel} />
                    </div>
                )}

                <div ref={scope} style={{ transformOrigin: '50% 100%' }}>
                    <button
                        type="button"
                        className="block w-full cursor-pointer rounded-full outline-offset-4 disabled:cursor-default"
                        onClick={onBunnyClick}
                        disabled={busy || hidden}
                        tabIndex={hidden ? -1 : 0}
                        aria-hidden={hidden}
                        aria-label="토끼에게 말 걸기"
                    >
                        <BunnyCharacter
                            expression={face}
                            holding={holding}
                            hopping={busy}
                            waving={mode === 'idle' || mode === 'talking'}
                            hatTier={hatTier}
                            className="h-auto w-full"
                        />
                    </button>
                </div>
            </div>

            <BunnySpeechBubble
                className="spot-bunny-bubble absolute z-30"
                message={bubble?.node ?? null}
                messageKey={bubble?.key ?? 'none'}
                tone={bubble?.tone}
            />
        </>
    );
}

function getBubble({
    mode,
    step,
    parcel,
    urgentTop,
    talk,
    isEmpty,
}: {
    mode: BunnyMode;
    step: DeliveryStep | null;
    parcel: Parcel | null;
    urgentTop?: PrioritizedTodo;
    talk: BunnyTalk | null;
    isEmpty: boolean;
}): { key: string; node: React.ReactNode; tone?: BubbleTone } | null {
    switch (mode) {
        case 'delivering':
            if (step === 'emerge') {
                return { key: `d-emerge-${parcel?.id}`, node: <p className="font-cute text-base">띵동~ 새 편지가 도착했어요! 💌</p> };
            }
            if (step === 'hop' && parcel) {
                return {
                    key: `d-hop-${parcel.id}`,
                    node: (
                        <p className="font-cute line-clamp-3 text-base">
                            &lsquo;{parcel.title}&rsquo; 구름까지 배달할게요! 🐰💨
                        </p>
                    ),
                };
            }
            return null;
        case 'urgent':
            if (!urgentTop) return null;
            return {
                key: `u-${urgentTop.todo.id}`,
                tone: 'urgent',
                node: (
                    <>
                        <p className="font-cute text-base">🚨 마감 임박!</p>
                        <p className="line-clamp-2 text-sm">
                            &lsquo;{urgentTop.todo.title}&rsquo;{' '}
                            {urgentTop.daysLeft != null && getUrgentHeadline(urgentTop.daysLeft)}
                        </p>
                    </>
                ),
            };
        case 'celebrating':
            return {
                key: 'celebrate',
                tone: 'celebrate',
                node: <p className="font-cute text-base">해냈어요! 정말 잘했어요! ⭐</p>,
            };
        case 'talking':
            return talk ? { key: `t-${talk.key}`, node: <p className="font-cute text-base">{talk.text}</p> } : null;
        case 'idle':
            return isEmpty
                ? {
                      key: 'empty',
                      node: (
                          <>
                              <p className="font-cute text-base">토끼가 첫 편지를 기다리고 있어요…</p>
                              <p className="text-xs opacity-80">할 일을 맡겨 주면 구름까지 배달해 드릴게요 💌</p>
                          </>
                      ),
                  }
                : null;
        default:
            return null;
    }
}
