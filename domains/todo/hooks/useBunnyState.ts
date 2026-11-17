'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useBunnyStore } from '../stores/useBunnyStore';
import type { BunnyExpression, BunnyMode } from '../types/bunny';
import type { TodoPriority } from './useTodoPriority';

/** 화면에 들어온 뒤 긴급 알림을 시작하기까지 기다리는 시간 */
const URGENT_START_DELAY_MS = 1200;

/**
 * 토끼의 상태를 한 곳에서 계산하는 훅
 *
 * 우선순위: celebrating > delivering > urgent > talking > sleeping > idle
 * 단, 배달(delivering)은 애니메이션이 끝날 때까지 다른 상태로 바뀌지 않습니다.
 * 그래서 배달 중에 완료 축하가 생기면, 배달이 끝난 뒤에 축하해요.
 */
export function useBunnyState(priority: TodoPriority) {
    const deliveryQueue = useBunnyStore((state) => state.deliveryQueue);
    const celebration = useBunnyStore((state) => state.celebration);
    const talk = useBunnyStore((state) => state.talk);

    const parcel = deliveryQueue[0] ?? null;

    // ── 긴급 알림 공연 ──
    // 화면에 들어왔을 때, 또는 새로운 할 일이 긴급 상태가 되었을 때 한 번만 실행합니다.
    const urgentKey = priority.urgent
        .map((p) => p.todo.id)
        .sort()
        .join(',');
    const performedIdsRef = useRef<Set<string>>(new Set());
    const [urgentActive, setUrgentActive] = useState(false);

    useEffect(() => {
        if (!priority.hydrated || !urgentKey) return;
        const ids = urgentKey.split(',');
        if (ids.every((id) => performedIdsRef.current.has(id))) return;

        const timer = setTimeout(() => {
            ids.forEach((id) => performedIdsRef.current.add(id));
            setUrgentActive(true);
        }, URGENT_START_DELAY_MS);
        return () => clearTimeout(timer);
    }, [urgentKey, priority.hydrated]);

    /** 긴급 공연이 끝나면 토끼 무대(BunnyStage)가 호출해요. */
    const endUrgent = useCallback(() => setUrgentActive(false), []);

    // ── 상태 결정 ──
    const hasUrgent = priority.urgent.length > 0;
    let mode: BunnyMode;
    if (parcel) mode = 'delivering';
    else if (celebration) mode = 'celebrating';
    else if (urgentActive && hasUrgent) mode = 'urgent';
    else if (talk) mode = 'talking';
    else if (priority.resting.length > 0 && !hasUrgent) mode = 'sleeping';
    else mode = 'idle';

    // 평소 표정: 긴급한 일이 있으면 걱정, 여유로우면 편안, 아무것도 없으면 행복
    const expression: BunnyExpression = hasUrgent
        ? 'worried'
        : priority.active.length > 0
          ? 'calm'
          : 'happy';

    return { mode, parcel, celebration, talk, expression, endUrgent };
}
