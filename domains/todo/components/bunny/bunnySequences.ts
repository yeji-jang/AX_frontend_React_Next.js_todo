import type { useAnimate } from 'motion/react';
import type { DeliveryStep } from '../../types/bunny';

type Animate = ReturnType<typeof useAnimate>[1];

/** 애니메이션을 실행할 토끼(배우) 정보 */
export interface Actor {
    animate: Animate;
    el: HTMLElement;
    /** 이 연출이 아직 유효한지 (다른 상태로 바뀌면 false) */
    alive: () => boolean;
    /** 현재 가로 위치 (px, 집 앞 기본 위치 = 0) */
    x: number;
}

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * 깡총 한 번
 * 1) 웅크리기(예비 동작) → 2) 위로 늘어나며 점프 → 3) 떨어지기
 */
export async function hopTo(
    actor: Actor,
    toX: number,
    { height = 36, speed = 1 }: { height?: number; speed?: number } = {},
) {
    const { animate, el } = actor;
    const from = actor.x;
    await animate(el, { scaleX: 1.12, scaleY: 0.86 }, { duration: 0.08 / speed, ease: 'easeOut' });
    await animate(
        el,
        { x: (from + toX) / 2, y: -height, scaleX: 0.93, scaleY: 1.08 },
        { duration: 0.21 / speed, ease: [0.2, 0.7, 0.4, 1] },
    );
    await animate(
        el,
        { x: toX, y: 0, scaleX: 1, scaleY: 1 },
        { duration: 0.19 / speed, ease: [0.6, 0, 0.85, 0.4] },
    );
    actor.x = toX;
}

/** 착지: 찌그러졌다가 말랑하게 튕기며 원래 모양으로 */
export async function land(actor: Actor, strong = false) {
    const { animate, el } = actor;
    await animate(
        el,
        { scaleX: strong ? 1.2 : 1.1, scaleY: strong ? 0.76 : 0.88 },
        { duration: 0.08, ease: 'easeOut' },
    );
    await animate(el, { scaleX: 1, scaleY: 1 }, { type: 'spring', stiffness: 520, damping: 11 });
}

/** 여러 번 깡총거리며 이동 */
export async function travel(
    actor: Actor,
    toX: number,
    { step = 70, height = 30, speed = 1 }: { step?: number; height?: number; speed?: number } = {},
) {
    const distance = toX - actor.x;
    const hops = Math.max(1, Math.round(Math.abs(distance) / step));
    const start = actor.x;
    for (let i = 1; i <= hops; i++) {
        if (!actor.alive()) return;
        await hopTo(actor, start + (distance * i) / hops, { height, speed });
    }
}

/** 집 앞 기본 위치로 돌아가기 (visible=false면 사라짐: 침대에서 자는 중) */
export async function returnHome(actor: Actor, visible: boolean) {
    await actor.animate(
        actor.el,
        { x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1, opacity: visible ? 1 : 0 },
        { duration: 0.45, ease: 'easeInOut' },
    );
    actor.x = 0;
}

/**
 * 배달: 우체통에서 쏙 등장 → 편지 보여주기 → 통통 이동 → 높이 점프하며 편지를 구름으로 던지기
 * @param fromX 우체통 위치 (토끼 기본 위치 기준 px)
 */
export async function runDelivery(
    actor: Actor,
    { fromX, onStep }: { fromX: number; onStep: (step: DeliveryStep) => void },
) {
    const { animate, el } = actor;

    onStep('emerge');
    await animate(el, { x: fromX, y: 28, rotate: 0, scaleX: 0.4, scaleY: 0.4, opacity: 0 }, { duration: 0 });
    actor.x = fromX;
    await animate(
        el,
        { y: -40, scaleX: 0.94, scaleY: 1.1, opacity: 1 },
        { duration: 0.38, ease: [0.2, 0.8, 0.3, 1] },
    );
    await animate(el, { y: 0, scaleX: 1, scaleY: 1 }, { duration: 0.22, ease: [0.6, 0, 0.85, 0.4] });
    await land(actor);
    if (!actor.alive()) return;
    await wait(800); // 편지를 들고 "띵동~"

    if (!actor.alive()) return;
    onStep('hop');
    await travel(actor, 0, { step: Math.max(40, Math.abs(fromX) / 2), height: 34 });
    await land(actor);
    if (!actor.alive()) return;
    await wait(250);

    // 크게 웅크렸다가 높이 점프하며 편지를 던져요.
    await animate(el, { scaleX: 1.18, scaleY: 0.8 }, { duration: 0.14, ease: 'easeOut' });
    if (!actor.alive()) return;
    onStep('toss');
    await animate(el, { y: -62, scaleX: 0.9, scaleY: 1.12 }, { duration: 0.28, ease: [0.2, 0.7, 0.4, 1] });
    await animate(el, { y: 0, scaleX: 1, scaleY: 1 }, { duration: 0.24, ease: [0.6, 0, 0.85, 0.4] });
    await land(actor, true);
    await wait(450); // 편지가 하늘로 떠오르는 시간
}

/**
 * 긴급: 집 주변을 빠르게 뛰어다니며 신문을 뿌려요. (한 번만)
 * @param width 들판 너비 (이동 거리 계산용)
 * @param onBurst 신문을 뿌릴 때마다 현재 위치를 알려줘요.
 */
export async function runUrgent(
    actor: Actor,
    { width, onBurst }: { width: number; onBurst: (x: number) => void },
) {
    const waypoints = [-0.16 * width, -0.36 * width, -0.12 * width];
    for (const point of waypoints) {
        if (!actor.alive()) return;
        await travel(actor, point, { step: 60, height: 26, speed: 1.25 });
        if (!actor.alive()) return;
        onBurst(actor.x);
        await wait(260);
    }
    await travel(actor, 0, { step: 60, height: 26, speed: 1.25 });
    await land(actor);
    await wait(1800); // 마지막 신문이 떨어질 때까지
}

/** 축하: 두 번 점프, 두 번째는 빙글 돌기 */
export async function runCelebrate(actor: Actor) {
    const { animate, el } = actor;
    await animate(el, { x: 0, opacity: 1 }, { duration: 0.2 });
    actor.x = 0;
    await hopTo(actor, 0, { height: 46 });
    await land(actor);
    if (!actor.alive()) return;
    await animate(el, { scaleX: 1.16, scaleY: 0.82 }, { duration: 0.1 });
    await animate(el, { y: -72, rotate: 360, scaleX: 0.92, scaleY: 1.1 }, { duration: 0.42, ease: [0.2, 0.7, 0.4, 1] });
    await animate(el, { y: 0, scaleX: 1, scaleY: 1 }, { duration: 0.26, ease: [0.6, 0, 0.85, 0.4] });
    await animate(el, { rotate: 0 }, { duration: 0 });
    await land(actor, true);
    await wait(1200);
}

/** 말 걸기: 제자리에서 가볍게 깡총 */
export async function runTalk(actor: Actor) {
    await actor.animate(actor.el, { opacity: 1 }, { duration: 0.2 });
    await hopTo(actor, 0, { height: 18 });
    await land(actor);
}
