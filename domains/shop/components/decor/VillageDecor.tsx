'use client';

import { AnimatePresence, motion } from 'motion/react';
import type { DayPeriod } from '@/domains/todo/types/bunny';
import type { DecorId } from '../../types/shop.types';
import DecorArt from './DecorArt';

/** 하늘에 놓이는 소품 (나머지는 들판에 놓여요) */
const SKY_DECOR: DecorId[] = ['balloon', 'rainbow'];

interface VillageDecorProps {
    placed: DecorId[];
    layer: 'sky' | 'ground';
    period: DayPeriod;
}

/**
 * 잡화점에서 사서 "놓기"한 소품을 마을에 배치해요.
 * 소품마다 자리가 정해져 있어서(globals.css의 .decor-spot--*) 토끼·집·우체통을 가리지 않아요.
 * 새로 놓으면 땅에서 퐁! 하고 튀어나와요.
 */
export default function VillageDecor({ placed, layer, period }: VillageDecorProps) {
    const items = placed.filter((id) => SKY_DECOR.includes(id) === (layer === 'sky'));

    return (
        <AnimatePresence>
            {items.map((id) => (
                <motion.div
                    key={id}
                    className={`decor-spot decor-spot--${id} pointer-events-none absolute`}
                    style={{ transformOrigin: '50% 100%' }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0, transition: { duration: 0.25 } }}
                    transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                    aria-hidden
                >
                    <DecorArt id={id} period={period} className="h-auto w-full" />
                </motion.div>
            ))}
        </AnimatePresence>
    );
}
