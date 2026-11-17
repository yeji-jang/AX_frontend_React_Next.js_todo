import Header from '@/shared/components/Header';
import { Suspense } from 'react';
interface TodoLayoutProps {
    children: React.ReactNode;
}
export default function TodoLayout({
    children,
}: TodoLayoutProps): React.ReactNode {
    return (
        <div className="mx-auto w-full min-w-xs max-w-5xl px-3 pb-10 sm:px-4">
            <Suspense fallback={<div className="p-4 text-sm">🐰 토끼가 오는 중...</div>}>
                <Header />
                <main>{children}</main>
            </Suspense>
        </div>
    );
}
