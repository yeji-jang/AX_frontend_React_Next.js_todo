'use client';

import { motion } from 'motion/react';

interface NewspaperEffectProps {
    /** 신문 헤드라인 아래 문구 (예: '3일 남았어요!') */
    headline: string;
    /** 몇 번째 뿌리기인지 (신문이 날아가는 방향을 조금씩 다르게) */
    seed: number;
}

const PAPERS = 4;

/**
 * 토끼가 공중에 뿌리는 신문
 * 위로 솟았다가 팔랑팔랑 흔들리며 떨어지고 사라져요. (한 번만 재생)
 * 날아가는 방향은 seed로 계산해서 무작위처럼 보이지만 항상 같아요.
 */
export default function NewspaperEffect({ headline, seed }: NewspaperEffectProps) {
    return (
        <div className="pointer-events-none absolute bottom-[70%] left-1/2 z-30" aria-hidden>
            {Array.from({ length: PAPERS }, (_, i) => {
                const spread = ((i + seed) % PAPERS) - (PAPERS - 1) / 2; // -1.5 ~ 1.5
                const dx = spread * 46 + (seed % 2 ? 12 : -12);
                const peak = 120 + ((i * 37 + seed * 13) % 50);
                const fall = 30 + ((i * 23 + seed * 7) % 40);
                const spin = (i % 2 ? 1 : -1) * (14 + i * 6);

                return (
                    <motion.div
                        key={i}
                        className="newspaper"
                        initial={{ x: 0, y: 0, rotate: 0, scale: 0.4, opacity: 0 }}
                        animate={{
                            x: [0, dx * 0.7, dx, dx * 1.15],
                            y: [0, -peak, -peak + fall * 0.6, -peak + fall],
                            rotate: [0, spin, -spin * 0.6, spin * 0.4],
                            scale: [0.4, 1, 1, 0.95],
                            opacity: [0, 1, 1, 0],
                        }}
                        transition={{
                            duration: 2.6,
                            delay: i * 0.08,
                            times: [0, 0.3, 0.7, 1],
                            ease: 'easeOut',
                        }}
                    >
                        <span className="newspaper__title">마감 임박!</span>
                        <span className="newspaper__body">{headline}</span>
                    </motion.div>
                );
            })}
        </div>
    );
}
