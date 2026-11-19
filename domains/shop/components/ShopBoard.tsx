'use client';

import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useState } from 'react';
import BunnyCharacter from '@/domains/todo/components/bunny/BunnyCharacter';
import { useDayPeriod } from '@/shared/hooks/useDayPeriod';
import { cn } from '@/shared/utils/cn';
import { CATEGORY_LABELS, SHOP_ITEMS } from '../constants/shopCatalog';
import { useShopStore } from '../stores/useShopStore';
import type { DayPeriod } from '@/domains/todo/types/bunny';
import type { HatId, ShopCategory, ShopItem } from '../types/shop.types';
import { DAILY_DEAL_PERCENT_OFF, formatCarrots, getDailyDeal, getPrice, REWARD } from '../utils/carrotRules';
import CarrotIcon from './CarrotIcon';
import CarrotWallet from './CarrotWallet';
import ItemPreview from './ItemPreview';
import ShopKeeper, { type KeeperMood } from './ShopKeeper';
import TypewriterText from './TypewriterText';

/** 다람의 대사 (choice가 있으면 "예/아니요" 버튼이 나와요) */
interface Dialogue {
    key: number;
    text: string;
    mood: KeeperMood;
    confirm?: ShopItem;
}

let dialogueKey = 0;
const say = (text: string, mood: KeeperMood = 'talking', confirm?: ShopItem): Dialogue => ({
    key: ++dialogueKey,
    text,
    mood,
    confirm,
});

const CATEGORIES: ShopCategory[] = ['hat', 'decor', 'paper'];

/** 아이템이 지금 어떤 상태인지 (버튼 문구를 정할 때 사용) */
type ItemState = 'equipped' | 'owned' | 'locked' | 'free' | 'buy';

/**
 * 다람 잡화점
 *  - 당근으로 모자 · 마을 소품 · 편지지를 사요.
 *  - 산 물건은 바로 쓰거나 마을에 놓을 수 있어요.
 *  - 매일 한 가지 물건을 30% 싸게 팔아요. (오늘의 특가)
 */
export default function ShopBoard() {
    const hydrated = useShopStore((state) => state._hasHydrated);
    const status = useShopStore((state) => state.status);
    const userId = useShopStore((state) => state.userId);
    const load = useShopStore((state) => state.load);
    const needsSetup = useShopStore((state) => state.needsSetup);

    if (status === 'error' && !hydrated) {
        return (
            <div role="alert" className="paper-panel flex flex-col items-center gap-3 px-6 py-16 text-center">
                <p className="font-cute text-lg text-[#65564B]">
                    {needsSetup ? '잡화점이 아직 공사 중이에요. 🚧' : '잡화점 문을 열지 못했어요. 😢'}
                </p>
                {needsSetup && (
                    <p className="max-w-md text-sm text-[#65564B]/80">
                        Supabase SQL Editor에서{' '}
                        <code className="rounded bg-[#65564B]/10 px-1">supabase/migrations/20261118_village_friends.sql</code>{' '}
                        을 한 번 실행하면 문이 열려요.
                    </p>
                )}
                <button type="button" className="choice-btn" onClick={() => userId && void load(userId)}>
                    다시 시도
                </button>
            </div>
        );
    }

    if (!hydrated) {
        return (
            <div role="status" className="paper-panel flex flex-col items-center gap-3 px-6 py-16 text-center">
                <p className="font-cute animate-pulse text-lg text-[#65564B]">🛍️ 잡화점 문을 여는 중이에요…</p>
            </div>
        );
    }
    return <ShopFloor />;
}

function ShopFloor() {
    const period = useDayPeriod();
    const {
        stars,
        carrots,
        owned,
        equippedHat,
        equippedPaper,
        placedDecor,
        purchase,
        equipHat,
        equipPaper,
        toggleDecor,
    } = useShopStore();

    const deal = getDailyDeal();
    const [tab, setTab] = useState<ShopCategory>(deal.category);
    const [selectedId, setSelectedId] = useState<ShopItem['id']>(deal.id);
    const [dialogue, setDialogue] = useState<Dialogue>(() =>
        say(
            carrots === 0
                ? `어서 오세요~ 다람 잡화점이에요! 할 일을 하나 끝낼 때마다 당근을 ${REWARD.base}개 넘게 받을 수 있어요. 당근을 모아서 놀러 와요!`
                : `어서 오세요~ 다람 잡화점이에요! 오늘의 특가는 '${deal.name}'! ${DAILY_DEAL_PERCENT_OFF}% 싸게 드려요.`,
            'happy',
        ),
    );
    // 구매 성공 축하 연출
    const [bought, setBought] = useState<{ key: number; item: ShopItem } | null>(null);
    // 서버에서 계산하는 동안 "살게요!"를 또 누르지 못하게 해요.
    const [buying, setBuying] = useState(false);

    const selected = SHOP_ITEMS.find((item) => item.id === selectedId) ?? deal;
    const items = SHOP_ITEMS.filter((item) => item.category === tab);

    const getState = (item: ShopItem): ItemState => {
        if (owned.includes(item.id)) {
            const inUse =
                item.category === 'hat'
                    ? equippedHat === item.id
                    : item.category === 'paper'
                      ? equippedPaper === item.id
                      : placedDecor.includes(item.id);
            return inUse ? 'equipped' : 'owned';
        }
        if (item.requiresStars && stars < item.requiresStars) return 'locked';
        return item.price === 0 ? 'free' : 'buy';
    };

    /** 산 물건 쓰기 / 놓기 / 치우기 */
    const applyItem = (item: ShopItem) => {
        if (item.category === 'hat') {
            equipHat(item.id);
            setDialogue(say(`'${item.name}', 토끼한테 정말 잘 어울려요!`, 'happy'));
        } else if (item.category === 'paper') {
            equipPaper(item.id);
            setDialogue(say(`이제 할 일 편지가 '${item.name}'에 담겨 배달될 거예요.`, 'happy'));
        } else {
            const placing = !placedDecor.includes(item.id);
            toggleDecor(item.id);
            setDialogue(
                say(
                    placing ? `'${item.name}'을(를) 마을에 놓아 뒀어요. 마을에 가서 확인해 봐요!` : `'${item.name}'은(는) 가방에 잘 넣어 뒀어요.`,
                    'happy',
                ),
            );
        }
    };

    /** 물건을 눌렀을 때: 상태에 맞게 다람이 말을 걸어요. */
    const onItemAction = (item: ShopItem) => {
        setSelectedId(item.id);
        const state = getState(item);
        if (state === 'owned' || state === 'equipped') {
            if (state === 'equipped' && item.category !== 'decor') {
                setDialogue(say(`'${item.name}'은(는) 지금 쓰고 있어요.`, 'happy'));
                return;
            }
            applyItem(item);
            return;
        }
        if (state === 'locked') {
            setDialogue(
                say(`'${item.name}'은(는) 별 스티커가 ${item.requiresStars}개 있어야 드릴 수 있어요. 지금은 ${stars}개! 조금만 더 힘내요.`, 'sorry'),
            );
            return;
        }
        const price = getPrice(item);
        setDialogue(
            say(
                price === 0
                    ? `별 스티커를 모은 선물이에요! '${item.name}', 받아 갈래요?`
                    : `'${item.name}'은(는) 당근 ${formatCarrots(price)}개예요. 살래요?`,
                'talking',
                item,
            ),
        );
    };

    const confirmPurchase = async (item: ShopItem) => {
        if (buying) return;
        setBuying(true);
        const result = await purchase(item.id);
        setBuying(false);
        if (result === 'ok') {
            setBought({ key: Date.now(), item });
            // 산 물건은 바로 써 볼 수 있게 해 줘요.
            if (item.category === 'hat') equipHat(item.id);
            if (item.category === 'paper') equipPaper(item.id);
            if (item.category === 'decor' && !placedDecor.includes(item.id)) toggleDecor(item.id);
            setDialogue(
                say(
                    item.category === 'decor'
                        ? `고마워요! '${item.name}'은(는) 마을에 바로 놓아 드렸어요. 또 와요~!`
                        : `고마워요! '${item.name}', 바로 써 볼 수 있게 해 뒀어요. 또 와요~!`,
                    'thanks',
                ),
            );
        } else if (result === 'insufficient') {
            const short = getPrice(item) - carrots;
            setDialogue(say(`앗, 당근이 ${formatCarrots(short)}개 모자라요… 할 일을 조금만 더 끝내고 와요!`, 'sorry'));
        } else if (result === 'locked') {
            setDialogue(say(`별 스티커가 ${item.requiresStars}개 필요해요. 조금만 더 힘내요!`, 'sorry'));
        } else if (result === 'error') {
            setDialogue(say('앗, 계산대가 잠깐 멈췄어요… 잠시 후에 다시 해 볼래요?', 'sorry'));
        } else {
            setDialogue(say('그건 이미 가지고 있는 물건이에요!', 'happy'));
        }
    };

    return (
        <MotionConfig reducedMotion="user">
            <div className="space-y-5">
                {/* ── 간판 + 지갑 ── */}
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="shop-sign">
                        <span className="shop-sign__text font-cute">🥕 다람 잡화점</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="stat-chip">⭐ 별 {stars}</span>
                        <CarrotWallet asLink={false} />
                    </div>
                </div>

                {/* ── 주인 + 대화창 ── */}
                <section className="shop-counter" aria-label="잡화점 주인과의 대화">
                    <div className="w-[96px] shrink-0 sm:w-[130px]">
                        <ShopKeeper mood={dialogue.mood} className="h-auto w-full" />
                    </div>
                    <div className="dialogue-box grow">
                        <span className="dialogue-box__name font-cute">다람</span>
                        <p className="font-cute min-h-[3.2em] text-base leading-relaxed sm:text-lg" aria-live="polite">
                            <TypewriterText key={dialogue.key} text={dialogue.text} />
                        </p>
                        {dialogue.confirm && (
                            <div className="mt-2 flex flex-wrap justify-end gap-2">
                                <button
                                    type="button"
                                    className="choice-btn choice-btn--yes"
                                    disabled={buying}
                                    onClick={() => dialogue.confirm && void confirmPurchase(dialogue.confirm)}
                                >
                                    {buying ? '계산 중…' : getPrice(dialogue.confirm) === 0 ? '받을래요!' : '살게요!'}
                                </button>
                                <button
                                    type="button"
                                    className="choice-btn"
                                    onClick={() => setDialogue(say('천천히 둘러봐요~', 'happy'))}
                                >
                                    그만둘래요
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                    <div className="space-y-4">
                        {/* ── 카테고리 탭 ── */}
                        <div className="tab-group" role="tablist" aria-label="물건 종류">
                            {CATEGORIES.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    role="tab"
                                    aria-selected={tab === category}
                                    className={cn('tab-btn', tab === category && 'tab-btn--active')}
                                    onClick={() => setTab(category)}
                                >
                                    {CATEGORY_LABELS[category]}
                                </button>
                            ))}
                        </div>

                        {/* ── 진열대 ── */}
                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="tabpanel">
                            {items.map((item) => (
                                <ShopItemCard
                                    key={item.id}
                                    item={item}
                                    state={getState(item)}
                                    price={getPrice(item)}
                                    isDeal={item.id === deal.id}
                                    selected={item.id === selected.id}
                                    period={period}
                                    onSelect={() => {
                                        setSelectedId(item.id);
                                        setDialogue(say(item.description, 'talking'));
                                    }}
                                    onAction={() => onItemAction(item)}
                                />
                            ))}
                        </ul>
                    </div>

                    {/* ── 미리보기 ── */}
                    <aside className="fitting-room lg:sticky lg:top-4 lg:self-start" aria-label="미리보기">
                        <p className="font-cute text-sm text-[#75655A]">미리보기</p>
                        <FittingRoom item={selected} equippedHat={equippedHat} period={period} />
                        <p className="font-cute mt-2 text-lg text-[#65564B]">{selected.name}</p>
                        <p className="text-sm text-[#75655A]">{selected.description}</p>
                    </aside>
                </div>

                <PurchaseBurst bought={bought} onDone={() => setBought(null)} />
            </div>
        </MotionConfig>
    );
}

interface ShopItemCardProps {
    item: ShopItem;
    state: ItemState;
    price: number;
    isDeal: boolean;
    selected: boolean;
    period: DayPeriod;
    onSelect: () => void;
    onAction: () => void;
}

function ShopItemCard({ item, state, price, isDeal, selected, period, onSelect, onAction }: ShopItemCardProps) {
    const actionLabel = {
        equipped: item.category === 'decor' ? '치우기' : '사용 중',
        owned: item.category === 'decor' ? '마을에 놓기' : '쓰기',
        locked: `⭐ ${item.requiresStars}개 필요`,
        free: '🎁 받기',
        buy: '사기',
    }[state];

    return (
        <motion.li
            layout
            className="shop-item"
            data-selected={selected}
            data-state={state}
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {isDeal && <span className="deal-ribbon">오늘의 특가</span>}
            {state === 'equipped' && <span className="owned-badge">✓</span>}

            <button type="button" className="shop-item__shelf" onClick={onSelect} aria-label={`${item.name} 살펴보기`}>
                <span className="shop-item__art" data-category={item.category}>
                    <ItemPreview item={item} period={period} />
                </span>
            </button>

            <p className="font-cute mt-1 truncate text-center text-[15px] text-[#65564B]">{item.name}</p>

            {state === 'buy' && (
                <p className="price-tag">
                    <CarrotIcon className="h-4 w-4" />
                    {isDeal && <s className="text-xs opacity-60">{formatCarrots(item.price)}</s>}
                    <strong>{formatCarrots(price)}</strong>
                </p>
            )}

            <button
                type="button"
                className={cn('shop-item__action', `shop-item__action--${state}`)}
                onClick={onAction}
                aria-disabled={state === 'locked' || (state === 'equipped' && item.category !== 'decor')}
            >
                {actionLabel}
            </button>
        </motion.li>
    );
}

/** 미리보기: 모자는 토끼가 직접 써 보고, 소품은 잔디 위에, 편지지는 할 일 카드로 보여줘요. */
function FittingRoom({
    item,
    equippedHat,
    period,
}: {
    item: ShopItem;
    equippedHat: HatId;
    period: DayPeriod;
}) {
    return (
        <div className="fitting-room__stage" data-category={item.category}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={item.id}
                    className="flex h-full w-full items-end justify-center gap-2"
                    initial={{ opacity: 0, scale: 0.85, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    {item.category === 'hat' && (
                        <BunnyCharacter expression="excited" hat={item.id} waving className="h-auto w-[120px]" />
                    )}
                    {item.category === 'decor' && (
                        <>
                            <ItemPreview item={item} period={period} className="max-h-[140px] w-[130px]" />
                            <BunnyCharacter expression="happy" hat={equippedHat} className="h-auto w-[64px]" />
                        </>
                    )}
                    {item.category === 'paper' && (
                        <article className="memo-card mb-4 w-[200px] text-left" data-paper={item.id}>
                            <span className="dday-chip">D-3</span>
                            <p className="font-cute mt-2 text-lg text-[#65564B]">당근 밭에 물 주기</p>
                            <p className="mt-1 text-xs text-[#75655A]">📅 11월 21일 (토)까지</p>
                        </article>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

const CONFETTI = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    return {
        x: Math.cos(angle) * (110 + (i % 3) * 30),
        y: Math.sin(angle) * (80 + (i % 2) * 30) - 40,
        color: ['#F2C14E', '#FFB3C7', '#7CB7E8', '#A8D68B'][i % 4],
    };
});

/** 구매 성공: 화면 가운데 물건이 퐁! 하고 색종이가 터져요. */
function PurchaseBurst({
    bought,
    onDone,
}: {
    bought: { key: number; item: ShopItem } | null;
    onDone: () => void;
}) {
    return (
        <AnimatePresence>
            {bought && (
                <motion.div
                    key={bought.key}
                    className="pointer-events-none fixed inset-0 z-50 grid place-items-center"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    aria-hidden
                >
                    <div className="relative">
                        {CONFETTI.map((c, i) => (
                            <motion.span
                                key={i}
                                className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full"
                                style={{ background: c.color, marginLeft: -6, marginTop: -6 }}
                                initial={{ x: 0, y: 0, scale: 0 }}
                                animate={{ x: c.x, y: [0, c.y, c.y + 60], scale: [0, 1.2, 0.6], opacity: [1, 1, 0] }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                            />
                        ))}
                        <motion.div
                            className="purchase-pop"
                            initial={{ scale: 0, rotate: -15 }}
                            animate={{ scale: [0, 1.25, 1], rotate: [-15, 6, 0] }}
                            transition={{ duration: 0.55 }}
                            onAnimationComplete={() => setTimeout(onDone, 900)}
                        >
                            <div className="w-[96px]">
                                <ItemPreview item={bought.item} />
                            </div>
                            <p className="font-cute mt-1 text-center text-base text-[#7A5A12]">{bought.item.name} 획득!</p>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
