import ShopBoard from '@/domains/shop/components/ShopBoard';
import { Button } from '@/shared/components/ui/button';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: '다람 잡화점 · Bunny Post',
};

// 당근 지갑과 가방이 브라우저 저장소(localStorage)에 있어서
// 화면은 클라이언트 컴포넌트(ShopBoard)가 그려요.
export default function ShopPage(): React.JSX.Element {
    return (
        <div className="mx-auto max-w-4xl space-y-4">
            <Link href="/">
                <Button className="btn-soft">← 마을로 돌아가기</Button>
            </Link>
            <ShopBoard />
        </div>
    );
}
