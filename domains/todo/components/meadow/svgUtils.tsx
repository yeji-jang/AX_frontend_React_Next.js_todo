import { useId } from 'react';

/** SVG 안에서 겹치지 않는 id를 만들어 주는 작은 도우미 */
export function useSvgIds() {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
    return {
        id: (name: string) => `${name}-${uid}`,
        url: (name: string) => `url(#${name}-${uid})`,
    };
}

/** 점토 표면 질감 필터 */
export function GrainFilter({ id, strength = 0.15 }: { id: string; strength?: number }) {
    return (
        <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="11" result="noise" />
            <feColorMatrix
                in="noise"
                type="matrix"
                values={`0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 ${strength} 0`}
                result="dots"
            />
            <feComposite in="dots" in2="SourceGraphic" operator="in" result="grainIn" />
            <feMerge>
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="grainIn" />
            </feMerge>
        </filter>
    );
}
