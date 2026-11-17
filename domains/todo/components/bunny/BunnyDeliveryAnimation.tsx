'use client';

import { motion } from 'motion/react';
import type { Parcel } from '../../types/bunny';

/** 할 일 카드와 같은 layoutId → 편지가 사라지면서 카드 자리로 날아가 카드가 돼요. */
export function cardLayoutId(todoId: string): string {
    return `todo-card-${todoId}`;
}

interface BunnyDeliveryAnimationProps {
    parcel: Parcel;
}

/**
 * 토끼가 하늘로 던진 편지
 * 배달이 끝나는 순간 이 편지는 사라지고, 같은 layoutId를 가진 구름 위 카드가
 * 편지 자리에서부터 날아가 제자리에 "통" 하고 내려앉아요.
 */
export default function BunnyDeliveryAnimation({ parcel }: BunnyDeliveryAnimationProps) {
    return (
        <motion.div
            layoutId={cardLayoutId(parcel.id)}
            className="delivery-letter"
            style={{ borderRadius: 10 }}
            initial={{ y: 30, scale: 0.4, opacity: 0, rotate: -12 }}
            animate={{ y: -34, scale: 1, opacity: 1, rotate: [-12, 8, -4] }}
            // 스프링은 값이 2개(시작→끝)까지만 가능해서,
            // 3단계로 흔들리는 rotate만 일반(tween) 애니메이션으로 따로 지정해요.
            transition={{
                type: 'spring',
                stiffness: 220,
                damping: 14,
                rotate: { type: 'tween', duration: 0.6, ease: 'easeInOut' },
            }}
            aria-hidden
        >
            <span className="delivery-letter__seal">♥</span>
            <span className="line-clamp-1 text-[11px] font-bold text-[#65564B]">{parcel.title}</span>
        </motion.div>
    );
}
