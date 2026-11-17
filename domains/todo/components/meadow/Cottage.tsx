import type { DayPeriod } from '../../types/bunny';
import { GrainFilter, useSvgIds } from './svgUtils';

interface CottageProps {
    period: DayPeriod;
    className?: string;
    /** 침실 창문 안에 들어갈 내용 (토끼가 잘 때) */
    children?: React.ReactNode;
}

/**
 * 크림색 지붕의 작은 집
 * 오른쪽 아치형 창문이 토끼의 침실이에요. children은 그 창문 위치에 겹쳐서 보여줍니다.
 * (창문 위치: 가로 47.3% ~ 79%, 세로 55% ~ 85%)
 */
export default function Cottage({ period, className, children }: CottageProps) {
    const { id, url } = useSvgIds();
    const night = period === 'night' || period === 'evening';

    return (
        <div className={className}>
            <svg viewBox="0 0 220 200" aria-hidden className="h-auto w-full overflow-visible">
                <defs>
                    <linearGradient id={id('wall')} x1="0" y1="0" x2="0.2" y2="1">
                        <stop offset="0" stopColor="#FFEBDD" />
                        <stop offset="1" stopColor="#F6CDB4" />
                    </linearGradient>
                    <radialGradient id={id('roof')} cx="0.35" cy="0.3" r="0.9">
                        <stop offset="0" stopColor="#FFFBEF" />
                        <stop offset="0.6" stopColor="#FFF0CF" />
                        <stop offset="1" stopColor="#EBD3A2" />
                    </radialGradient>
                    <radialGradient id={id('room')} cx="0.5" cy="0.4" r="0.8">
                        <stop offset="0" stopColor={night ? '#FFE6A6' : '#FFF3D9'} />
                        <stop offset="1" stopColor={night ? '#F5B964' : '#F2D7AE'} />
                    </radialGradient>
                    <radialGradient id={id('glass')} cx="0.4" cy="0.35" r="0.7">
                        <stop offset="0" stopColor={night ? '#FFF6C4' : '#FFFFFF'} />
                        <stop offset="1" stopColor={night ? '#FFC94D' : '#CDEBFA'} />
                    </radialGradient>
                    <linearGradient id={id('door')} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#C49A7B" />
                        <stop offset="1" stopColor="#A98268" />
                    </linearGradient>
                    <GrainFilter id={id('grain')} />
                </defs>

                {/* 굴뚝 연기 */}
                <g fill="#ffffff" opacity="0.9">
                    <circle className="house-smoke" cx="162" cy="24" r="7" />
                    <circle className="house-smoke house-smoke--2" cx="166" cy="18" r="9" />
                    <circle className="house-smoke house-smoke--3" cx="160" cy="12" r="6" />
                </g>

                <ellipse cx="110" cy="196" rx="96" ry="6" fill="rgba(70,110,50,0.2)" />

                <g filter={url('grain')}>
                    <rect x="150" y="30" width="22" height="46" rx="6" fill="#D9A88A" />
                    {/* 지붕 */}
                    <path
                        d="M16 98 L110 28 L204 98 Z"
                        fill={url('roof')}
                        stroke="#F3DFB4"
                        strokeWidth="16"
                        strokeLinejoin="round"
                    />
                    <ellipse cx="78" cy="58" rx="22" ry="6" fill="#fff" opacity="0.6" transform="rotate(-36 78 58)" />
                    <circle cx="110" cy="72" r="12" fill={url('glass')} stroke="#A98268" strokeWidth="4" />

                    {/* 벽 */}
                    <rect x="32" y="92" width="156" height="102" rx="16" fill={url('wall')} />

                    {/* 문 */}
                    <path d="M50 194 V142 a19 19 0 0 1 38 0 V194 Z" fill={url('door')} />
                    <circle cx="80" cy="168" r="3" fill="#FFE27A" />
                    <path d="M58 150 a11 11 0 0 1 22 0" stroke="#fff" strokeOpacity="0.35" strokeWidth="2.5" fill="none" />

                    {/* 침실 창문 */}
                    <path d="M104 170 V136 a35 26 0 0 1 70 0 V170 Z" fill={url('room')} />
                    <path d="M104 170 V136 a35 26 0 0 1 70 0 V170 Z" fill="none" stroke="#A98268" strokeWidth="5" />
                    <rect x="98" y="170" width="82" height="9" rx="4.5" fill="#C49A7B" />
                    {/* 화분 */}
                    {[110, 126, 142, 158, 172].map((cx, i) => (
                        <circle key={cx} cx={cx} cy="168" r="4" fill={['#FFB3C7', '#FFE27A', '#B9DEF7', '#FFB3C7', '#FFE27A'][i]} />
                    ))}
                </g>
            </svg>

            {/* 침실 창문 안 (토끼가 잘 때 침대가 보여요) */}
            {children && (
                <div className="absolute left-[47.3%] top-[55%] h-[30%] w-[31.8%] overflow-hidden rounded-t-[50%_40%]">
                    {children}
                </div>
            )}
        </div>
    );
}
