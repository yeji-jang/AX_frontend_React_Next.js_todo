import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';

interface EmptyStateProps {
    /** 큰 글씨로 보여줄 안내 문구 */
    title: string;
    /** 작은 글씨로 보여줄 보조 설명 (선택) */
    description?: string;
    /** 버튼을 누르면 이동할 주소 (선택) — actionLabel과 함께 넘겨야 버튼이 보입니다. */
    actionHref?: string;
    actionLabel?: string;
}

// 데이터가 하나도 없을 때 보여주는 공통 안내 화면입니다.
// 할 일 목록, 찜 목록 등 여러 곳에서 Props만 바꿔 재사용합니다.
// 상태(useState)나 이벤트가 없으므로 서버/클라이언트 어디서든 쓸 수 있습니다.
export default function EmptyState({
    title,
    description,
    actionHref,
    actionLabel,
}: EmptyStateProps): React.JSX.Element {
    return (
        <div className="paper-panel flex flex-col items-center gap-2 px-6 py-12 text-center">
            <p className="text-4xl" aria-hidden>
                📭🐰
            </p>
            <p className="font-cute text-xl text-[#65564B]">{title}</p>
            {description && <p className="text-sm text-[#75655A]">{description}</p>}
            {actionHref && actionLabel && (
                <Link href={actionHref} className="mt-3">
                    <Button className="btn-bunny">{actionLabel}</Button>
                </Link>
            )}
        </div>
    );
}
