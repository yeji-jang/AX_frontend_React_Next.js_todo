'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { useShopStore } from '../stores/useShopStore';
import { formatCarrots } from '../utils/carrotRules';
import CarrotIcon from './CarrotIcon';

const SHOW_MS = 3800;

/** 당근이 위로 퐁퐁 튀어 오르는 위치 */
const POPS = Array.from({ length: 8 }, (_, i) => ({
    x: (i - 3.5) * 22,
    y: -60 - (i % 3) * 18,
    delay: 0.15 + i * 0.05,
}));

/**
 * 할 일 완료 보상 영수증
 * 서버 저장에 성공하면 스토어의 lastReward가 채워지고, 마을 위에 영수증이 떠요.
 */
export default function RewardReceipt() {
    const reward = useShopStore((state) => state.lastReward);
    const dismiss = useShopStore((state) => state.dismissReward);

    const rewardKey = reward?.key;
    useEffect(() => {
        if (rewardKey === undefined) return;
        const timer = setTimeout(dismiss, SHOW_MS);
        return () => clearTimeout(timer);
    }, [rewardKey, dismiss]);

    return (
        <div className="pointer-events-none absolute inset-x-0 top-4 z-50 flex justify-center px-4" aria-live="polite">
            <AnimatePresence>
                {reward && (
                    <motion.div
                        key={reward.key}
                        className="reward-receipt pointer-events-auto"
                        initial={{ opacity: 0, y: -24, scale: 0.8, rotate: -4 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, y: -16, scale: 0.9, transition: { duration: 0.25 } }}
                        transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                        onClick={dismiss}
                        role="status"
                    >
                        {reward.repeat ? (
                            <p className="font-cute text-base">
                                이미 보상을 받은 편지예요 📮
                                <span className="mt-0.5 block text-xs opacity-80">당근은 처음 완료할 때만 받을 수 있어요.</span>
                            </p>
                        ) : (
                            <>
                                {POPS.map((pop, i) => (
                                    <motion.span
                                        key={i}
                                        className="absolute left-1/2 top-1/2"
                                        initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                                        animate={{ x: pop.x, y: [0, pop.y, pop.y + 30], scale: [0, 1.1, 0.8], opacity: [0, 1, 0] }}
                                        transition={{ duration: 1.1, delay: pop.delay, ease: 'easeOut' }}
                                        aria-hidden
                                    >
                                        <CarrotIcon className="h-5 w-5" />
                                    </motion.span>
                                ))}
                                <p className="reward-receipt__title">
                                    <CarrotIcon className="h-7 w-7" />
                                    <span>+{formatCarrots(reward.total)}</span>
                                </p>
                                <ul className="reward-receipt__lines">
                                    {reward.lines.map((line) => (
                                        <li key={line.label}>
                                            <span>{line.label}</span>
                                            <span>+{line.amount}</span>
                                        </li>
                                    ))}
                                    <li>
                                        <span>별 스티커</span>
                                        <span>⭐ +1</span>
                                    </li>
                                </ul>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
