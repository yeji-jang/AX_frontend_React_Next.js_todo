// 할 일 수정 페이지: /todo/[id]/edit
import TodoForm from '@/domains/todo/components/TodoForm';
import { getTodoById } from '@/domains/todo/queries/getTodoById.query';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export default function TodoEditPage({
    params,
}: PageProps<'/todo/[id]/edit'>): React.JSX.Element {
    return (
        <div className="paper-panel mx-auto max-w-2xl space-y-4 p-5 sm:p-8">
            <h1 className="font-cute text-2xl text-[#65564B]">✏️ 편지 고쳐 쓰기</h1>

            {/* id가 필요한 부분만 Suspense로 감싸고, 나머지는 바로 보여줍니다. */}
            <Suspense
                fallback={
                    <div
                        role="status"
                        className="h-64 animate-pulse rounded-3xl bg-[#F5ECDC]"
                    />
                }
            >
                {params.then(({ id }) => (
                    <TodoEditSection id={id} />
                ))}
            </Suspense>
        </div>
    );
}

// 서버 컴포넌트: 서버에서 기존 할 일을 조회한 뒤, 폼(클라이언트)에 Props로 전달합니다.
async function TodoEditSection({
    id,
}: {
    id: string;
}): Promise<React.JSX.Element> {
    const todo = await getTodoById(id);

    // 없거나 삭제된 할 일이면 [id]/not-found.tsx 화면을 보여줍니다.
    if (!todo) {
        notFound();
    }

    return (
        <>
            <Link href={`/todo/${todo.id}/view`}>
                <Button className="btn-soft">← 취소</Button>
            </Link>
            {/* 폼에 필요한 값만 골라서 넘깁니다. */}
            <TodoForm
                todo={{ id: todo.id, title: todo.title, content: todo.content }}
            />
        </>
    );
}
