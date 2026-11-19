'use client';

import { Button } from '@/shared/components/ui/button';
import { useDayPeriod } from '@/shared/hooks/useDayPeriod';
import { LayoutGroup, MotionConfig } from 'motion/react';
import Link from 'next/link';
import { useOptimistic, useState, useTransition } from 'react';
import { changeTodoStatus } from '../actions/todo.actions';
import { useBunnyDialogue } from '../hooks/useBunnyDialogue';
import { useBunnyState } from '../hooks/useBunnyState';
import { useTodoPriority } from '../hooks/useTodoPriority';
import { useBunnyStore } from '../stores/useBunnyStore';
import RewardReceipt from '@/domains/shop/components/RewardReceipt';
import { DEFAULT_HAT } from '@/domains/shop/constants/shopCatalog';
import { useShopStore } from '@/domains/shop/stores/useShopStore';
import { useShallow } from 'zustand/react/shallow';
import type { Todo, TodoStatus } from '../types/todo.types';
import BunnyCelebration from './bunny/BunnyCelebration';
import { BunnyBedroom, SleepingBubbles } from './bunny/BunnySleepingAnimation';
import BunnySpeechBubble from './bunny/BunnySpeechBubble';
import BunnyStage from './bunny/BunnyStage';
import DoneShelf from './DoneShelf';
import MeadowBackground from './meadow/MeadowBackground';
import TodoItems from './TodoItems';
import TodoSummary, { type TodoTab } from './TodoSummary';
import UrgentToast from './UrgentToast';

interface TodoDashBoardProps {
    initialItems: Todo[];
}

interface OptimisticUpdateType {
    id: string;
    nextStatus: TodoStatus;
}

// Bunny Post 메인 화면: 동화 속 마을 + 구름 위 할 일 + 토끼 배달원
export default function TodoDashBoard({
    initialItems,
}: TodoDashBoardProps): React.JSX.Element {
    const [isPending, startTransition] = useTransition();

    // 낙관적 상태 관리 훅
    // Props(initialItems)를 useState에 복사하지 않고 그대로 기준값으로 사용합니다.
    // → 서버가 revalidatePath로 새 목록을 보내면 화면이 자동으로 최신 상태가 됩니다. (상태 꼬임 방지)
    const [optimisticItems, setOptimisticItems] = useOptimistic(
        initialItems,
        (currentItems, { id, nextStatus }: OptimisticUpdateType) =>
            currentItems.map((item) =>
                item.id === id ? { ...item, status: nextStatus } : item,
            ),
    );

    // 마감 정보 + 정렬
    const priority = useTodoPriority(optimisticItems);
    // 토끼 상태 (하나의 훅에서 계산)
    const { mode, parcel, celebration, talk, expression, endUrgent } = useBunnyState(priority);

    const deliveryQueue = useBunnyStore((state) => state.deliveryQueue);
    const celebrate = useBunnyStore((state) => state.celebrate);
    const cancelCelebration = useBunnyStore((state) => state.cancelCelebration);

    // 별 · 잡화점에서 산 모자 · 마을 소품 (서버에서 불러오기 전에는 기본 모습으로 그려요)
    const shopHydrated = useShopStore((state) => state._hasHydrated);
    const stars = useShopStore((state) => (shopHydrated ? state.stars : 0));
    const hat = useShopStore((state) => (shopHydrated ? state.equippedHat : DEFAULT_HAT));
    const decor = useShopStore(useShallow((state) => (shopHydrated ? state.placedDecor : [])));
    const claimReward = useShopStore((state) => state.claimReward);

    const { talkNow } = useBunnyDialogue({
        activeCount: priority.active.length,
        doneCount: priority.done.length,
        urgentCount: priority.urgent.length,
    });

    const period = useDayPeriod();
    const [tab, setTab] = useState<TodoTab>('all');

    /**
     * 상태 변경 (기존 기능 그대로)
     * UI를 먼저 바꾸고 서버에 저장 → 실패하면 startTransition이 끝나며 자동으로 원래 상태로 복구돼요.
     */
    const changeStatus = (
        id: string,
        status: TodoStatus,
        callbacks?: { onSuccess?: () => void; onError?: () => void },
    ) => {
        const currentItem = optimisticItems.find((item) => item.id === id);
        if (currentItem && currentItem.status === status) return;

        startTransition(async () => {
            setOptimisticItems({ id, nextStatus: status });
            try {
                await changeTodoStatus(id, status);
                callbacks?.onSuccess?.();
            } catch (error) {
                console.error('상태 변경 실패:', error);
                callbacks?.onError?.();
                alert('할일 상태 변경에 실패하였습니다. 잠시 후 다시 시도하세요.');
            }
        });
    };

    // 완료: 토끼 축하 → 서버 저장 성공 시 당근 + 별 스티커, 실패 시 축하 취소 + 카드 복구
    // (당근은 서버 저장이 끝난 뒤에만 줘요. 실패했는데 당근을 받으면 안 되니까요.)
    const onComplete = (id: string, title: string) => {
        const daysLeft = priority.active.find((p) => p.todo.id === id)?.daysLeft ?? null;
        celebrate(id, title);
        changeStatus(id, 'DONE', {
            onSuccess: () => void claimReward({ id, title, daysLeft }),
            onError: () => cancelCelebration(id),
        });
    };

    const hiddenIds = deliveryQueue.map((p) => p.id);
    const entries = tab === 'all' ? priority.active : priority.today;
    const letters = priority.active.filter((p) => p.todo.status === 'READY').length;

    return (
        <MotionConfig reducedMotion="user">
            <LayoutGroup>
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Link href="/todo/pin">
                            <Button className="btn-soft">💖 찜목록</Button>
                        </Link>
                        <Link href="/shop">
                            <Button className="btn-soft">🛍️ 잡화점</Button>
                        </Link>
                        <Link href="/friends">
                            <Button className="btn-soft">👫 친구</Button>
                        </Link>
                    </div>
                    <Link href="/todo/new">
                        <Button className="btn-bunny">💌 할 일 맡기기</Button>
                    </Link>
                </div>

                <MeadowBackground
                    period={period}
                    decor={decor}
                    bedroom={mode === 'sleeping' ? <BunnyBedroom /> : undefined}
                    cottageOverlay={
                        mode === 'sleeping' ? (
                            <>
                                <SleepingBubbles />
                                <BunnySpeechBubble
                                    className="spot-cottage-bubble absolute z-30"
                                    message={
                                        <p className="font-cute text-base">
                                            아직 10일 남았어요. 천천히 해도 괜찮아요! 💤
                                        </p>
                                    }
                                    messageKey="sleeping"
                                    tone="sleepy"
                                    tail="left"
                                />
                            </>
                        ) : undefined
                    }
                    stage={
                        <BunnyStage
                            mode={mode}
                            parcel={parcel}
                            celebration={celebration}
                            talk={talk}
                            expression={expression}
                            hat={hat}
                            urgentTop={priority.urgent[0]}
                            letters={letters}
                            isEmpty={optimisticItems.length === 0}
                            onUrgentEnd={endUrgent}
                            onBunnyClick={talkNow}
                        />
                    }
                >
                    <TodoSummary
                        activeCount={priority.active.length}
                        doneCount={priority.done.length}
                        urgentCount={priority.urgent.length}
                        todayCount={priority.today.length}
                        stars={stars}
                        tab={tab}
                        onTabChange={setTab}
                    />

                    {/* 백그라운드 동기화 상태 표시 */}
                    <p className="mt-2 h-5 text-sm text-[#65564B]/70" aria-live="polite">
                        {isPending && <span className="animate-pulse">☁️ 구름과 동기화 중...</span>}
                    </p>

                    <TodoItems
                        entries={entries}
                        hiddenIds={hiddenIds}
                        emptyMessage={
                            tab === 'today'
                                ? '오늘까지 해야 할 일은 없어요. 여유로운 하루!'
                                : '하늘이 맑아요! 토끼에게 할 일을 맡겨 보세요.'
                        }
                        onChangeStatus={changeStatus}
                        onComplete={onComplete}
                    />

                    <DoneShelf entries={priority.done} onRestore={(id) => changeStatus(id, 'READY')} />

                    <BunnyCelebration eventKey={mode === 'celebrating' && celebration ? celebration.key : null} />
                    <RewardReceipt />
                </MeadowBackground>

                <UrgentToast active={mode === 'urgent'} urgent={priority.urgent} />
            </LayoutGroup>
        </MotionConfig>
    );
}
