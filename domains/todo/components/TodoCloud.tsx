import { cn } from '@/shared/utils/cn';

interface TodoCloudProps {
    /** 구름 모양 종류 (카드마다 조금씩 다르게) */
    variant: 0 | 1 | 2;
    /** 살짝 기울어진 각도 (deg) */
    rotate?: number;
    /** 둥실거리는 타이밍 차이 (s) */
    floatDelay?: number;
    className?: string;
}

/**
 * 할 일 카드가 올라앉는 몽실몽실한 구름 받침 (장식용)
 * 모양은 CSS(globals.css의 .cloud-base)로 그려요.
 * 기울기와 위아래 둥실거림은 이 구름에만 줘서, 위에 놓인 카드 글씨가 흐려지지 않게 해요.
 */
export default function TodoCloud({ variant, rotate = 0, floatDelay = 0, className }: TodoCloudProps) {
    return (
        <div
            className={cn('cloud-base', className)}
            data-variant={variant}
            style={{ rotate: `${rotate}deg`, animationDelay: `${floatDelay}s` }}
            aria-hidden
        />
    );
}
