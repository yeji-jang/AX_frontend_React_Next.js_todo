import { cn } from '@/shared/utils/cn';

/** 동글동글한 당근 아이콘 (Bunny Post의 화폐) */
export default function CarrotIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden className={cn('inline-block shrink-0', className)}>
            <path d="M12 7 Q10 3 7 2.5 M12 7 Q12 3 13 1.5 M12 7 Q14 3.5 17.5 3" stroke="#6BAF4F" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M7.5 8.5 Q12 5.5 16.5 8.5 Q15 16 12 22 Q9 16 7.5 8.5 Z" fill="#F59A4A" />
            <path d="M9.5 11.5 H12 M10.5 15 H13" stroke="#D97A2B" strokeWidth="1.3" strokeLinecap="round" />
            <ellipse cx="10" cy="9.5" rx="1.6" ry="0.9" fill="#fff" opacity="0.55" />
        </svg>
    );
}
