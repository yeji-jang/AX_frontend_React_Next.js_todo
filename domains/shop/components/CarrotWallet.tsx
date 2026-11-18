'use client';

import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useShopStore } from '../stores/useShopStore';
import { formatCarrots } from '../utils/carrotRules';
import CarrotIcon from './CarrotIcon';

interface CarrotWalletProps {
    /** 누르면 잡화점으로 이동 (기본값 true) */
    asLink?: boolean;
}

/**
 * 당근 지갑: 당근이 늘거나 줄면 숫자가 또르륵 굴러가고 "+150" 이 떠올라요.
 */
export default function CarrotWallet({ asLink = true }: CarrotWalletProps) {
    const hydrated = useShopStore((state) => state._hasHydrated);
    const carrots = useShopStore((state) => state.carrots);

    const count = useMotionValue(0);
    const text = useTransform(count, (v) => formatCarrots(Math.round(v)));
    const prevRef = useRef<number | null>(null);
    const [gain, setGain] = useState<{ key: number; amount: number } | null>(null);

    useEffect(() => {
        if (!hydrated) return;
        const prev = prevRef.current;
        prevRef.current = carrots;

        // 처음 불러올 때는 바로 보여 주고, 그 뒤 변화만 애니메이션해요.
        if (prev === null) {
            count.set(carrots);
            return;
        }
        if (prev === carrots) return;

        const controls = animate(count, carrots, { duration: 0.9, ease: 'easeOut' });
        if (carrots > prev) setGain({ key: Date.now(), amount: carrots - prev });
        return () => controls.stop();
    }, [carrots, hydrated, count]);

    const chip = (
        <span className="carrot-wallet" aria-label={`당근 ${formatCarrots(carrots)}개`}>
            <CarrotIcon className="h-5 w-5" />
            <motion.span className="tabular-nums">{hydrated ? text : '–'}</motion.span>
            <AnimatePresence>
                {gain && (
                    <motion.span
                        key={gain.key}
                        className="carrot-wallet__gain"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: [0, 1, 1, 0], y: -26 }}
                        transition={{ duration: 1.6, ease: 'easeOut' }}
                        onAnimationComplete={() => setGain(null)}
                        aria-hidden
                    >
                        +{formatCarrots(gain.amount)}
                    </motion.span>
                )}
            </AnimatePresence>
        </span>
    );

    if (!asLink) return chip;
    return (
        <Link href="/shop" className="rounded-full outline-offset-2" title="다람 잡화점 가기">
            {chip}
        </Link>
    );
}
