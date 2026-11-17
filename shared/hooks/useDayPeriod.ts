'use client';

import { useSyncExternalStore } from 'react';
import type { DayPeriod } from '@/domains/todo/types/bunny';

function getPeriod(hour: number): DayPeriod {
    if (hour >= 5 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 17) return 'day';
    if (hour >= 17 && hour < 20) return 'evening';
    return 'night';
}

// 1분마다 시간대가 바뀌었는지 확인합니다.
function subscribe(onChange: () => void) {
    const timer = setInterval(onChange, 60_000);
    return () => clearInterval(timer);
}

/**
 * 현재 시간대 (아침 / 낮 / 저녁 / 밤)
 * 서버에서는 시간대를 알 수 없으므로 'day'로 그리고, 브라우저에서 실제 시간대로 바꿉니다.
 * (useSyncExternalStore가 하이드레이션 오류 없이 처리해 줍니다.)
 */
export function useDayPeriod(): DayPeriod {
    return useSyncExternalStore(
        subscribe,
        () => getPeriod(new Date().getHours()),
        () => 'day',
    );
}
