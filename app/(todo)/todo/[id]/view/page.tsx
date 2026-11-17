// 동적 라우트: 폴더 이름의 [id] 자리에 들어온 값을 params로 받습니다.
//   /todo/abc/view  →  params = { id: 'abc' }
import TodoDetail from '@/domains/todo/components/TodoDetail';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { Suspense } from 'react';

// Next.js 16에서 params는 Promise입니다.
// 페이지 껍데기(목록으로 버튼 등)는 바로 보여주고,
// id가 필요한 부분만 <Suspense>로 감싸 데이터를 기다리는 동안 fallback을 보여줍니다.
export default function TodoViewPage({
    params,
}: PageProps<'/todo/[id]/view'>): React.JSX.Element {
    return (
        <div className="mx-auto max-w-2xl space-y-4">
            <Link href="/">
                <Button className="btn-soft">← 마을로 돌아가기</Button>
            </Link>

            <Suspense
                fallback={
                    <div
                        role="status"
                        className="h-48 animate-pulse rounded-3xl bg-[#F5ECDC]"
                    />
                }
            >
                {params.then(({ id }) => (
                    <TodoDetail id={id} />
                ))}
            </Suspense>
        </div>
    );
}
