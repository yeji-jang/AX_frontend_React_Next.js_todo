'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useBunnyStore } from '../stores/useBunnyStore';

const FIRST_VISIT_DELAY_MS = 25_000; // 처음 들어온 뒤 첫 방문까지
const MIN_INTERVAL_MS = 60_000; // 방문 간격 (1~2분)
const MAX_INTERVAL_MS = 120_000;
const BUSY_WINDOW_MS = 6_000; // 최근 6초 안에 조작했다면 방해하지 않아요.
const RETRY_WHEN_BUSY_MS = 10_000;
const TALK_DURATION_MS = 5_500;

interface DialogueContext {
    activeCount: number;
    doneCount: number;
    urgentCount: number;
}

/** 상황에 맞는 대사 후보 */
function getLines({ activeCount, doneCount, urgentCount }: DialogueContext): string[] {
    if (activeCount === 0 && doneCount === 0) {
        return ['할 일을 맡겨 주면 제가 배달해 드릴게요!', '오늘은 어떤 하루를 보낼 거예요?'];
    }
    if (activeCount === 0) {
        return ['와! 할 일을 다 끝냈어요! 🎉', '오늘도 멋진 하루를 보내고 있네요!', '잠깐 쉬어가는 것도 좋아요!'];
    }
    const lines = ['오늘 할 일은 얼마나 했어요?', '잠깐 쉬어가는 것도 좋아요!'];
    if (urgentCount > 0) lines.push('아직 할 일이 남아 있어요!', '조금만 더 힘내봐요!');
    if (doneCount === 1) lines.push('와! 벌써 하나를 완료했어요!');
    if (doneCount > 1) lines.push('오늘도 열심히 하고 있네요!', '오늘도 멋진 하루를 보내고 있네요!');
    return lines;
}

function pickLine(context: DialogueContext, last: string | null): string {
    const lines = getLines(context);
    const candidates = lines.length > 1 ? lines.filter((line) => line !== last) : lines;
    return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * 토끼의 랜덤 방문 대화
 *  - 너무 자주 나오지 않도록 1~2분 간격
 *  - 사용자가 조작 중이거나 다른 탭을 보고 있으면 미뤄요.
 *  - 말풍선은 5.5초 뒤에 자연스럽게 사라져요.
 *  - talkNow(): 토끼를 클릭했을 때 바로 말하기
 */
export function useBunnyDialogue(context: DialogueContext) {
    const say = useBunnyStore((state) => state.say);
    const hush = useBunnyStore((state) => state.hush);
    const talk = useBunnyStore((state) => state.talk);

    const contextRef = useRef(context);
    const lastLineRef = useRef<string | null>(null);
    const lastInteractionRef = useRef(0);

    // 최신 상황을 ref에 보관 (타이머 안에서 읽기 위해)
    useEffect(() => {
        contextRef.current = context;
    });

    const speak = useCallback(() => {
        const line = pickLine(contextRef.current, lastLineRef.current);
        lastLineRef.current = line;
        say(line);
    }, [say]);

    // 사용자 조작 기록
    useEffect(() => {
        const mark = () => {
            lastInteractionRef.current = Date.now();
        };
        const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
        events.forEach((event) => window.addEventListener(event, mark, { passive: true }));
        return () => events.forEach((event) => window.removeEventListener(event, mark));
    }, []);

    // 랜덤 방문 타이머
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        const schedule = (delay: number) => {
            timer = setTimeout(visit, delay);
        };
        const visit = () => {
            const busy = Date.now() - lastInteractionRef.current < BUSY_WINDOW_MS;
            if (busy || document.hidden) {
                schedule(RETRY_WHEN_BUSY_MS);
                return;
            }
            speak();
            schedule(MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS));
        };

        schedule(FIRST_VISIT_DELAY_MS);
        return () => clearTimeout(timer);
    }, [speak]);

    // 말풍선 자동으로 닫기
    const talkKey = talk?.key;
    useEffect(() => {
        if (talkKey === undefined) return;
        const timer = setTimeout(hush, TALK_DURATION_MS);
        return () => clearTimeout(timer);
    }, [talkKey, hush]);

    return { talkNow: speak };
}
