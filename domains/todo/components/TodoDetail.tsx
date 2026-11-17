// 서버 컴포넌트: 서버에서 Supabase로 할 일 1개를 조회해 HTML로 만들어 보냅니다.
// → 브라우저는 완성된 화면을 바로 받으므로 첫 화면이 빠르고, 조회 코드가 브라우저로 전송되지 않습니다.
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiEdit2 } from 'react-icons/fi';
import { TODO_STATUS_MAP } from '../constants/todoStatus';
import { getTodoById } from '../queries/getTodoById.query';
import DeleteTodoButton from './DeleteTodoButton';
import DueDateBadge from './DueDateBadge';
import TodoContentViewer from './TodoContentViewer';

interface TodoDetailProps {
    /** 주소창의 [id] 부분 (예: /todo/abc/view → 'abc') */
    id: string;
}

// 날짜를 한국 시간 기준 "2026. 11. 16. 오후 3:20" 형태로 바꿉니다.
// (Vercel 서버는 UTC 시간대라서 timeZone을 꼭 지정해야 합니다.)
function formatDate(value?: string): string {
    if (!value) return '-';
    return new Date(value).toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul',
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export default async function TodoDetail({
    id,
}: TodoDetailProps): Promise<React.JSX.Element> {
    const todo = await getTodoById(id);

    // 없는 id이거나 다른 사람의 할 일이면 not-found.tsx 화면을 보여줍니다.
    if (!todo) {
        notFound();
    }

    return (
        <article className="paper-panel p-6 sm:p-8">
            <div className="mb-2 flex items-start justify-between gap-2">
                <span className="status-chip" data-status={todo.status}>
                    {TODO_STATUS_MAP[todo.status]}
                </span>
                <div className="flex items-start gap-2">
                    <Link href={`/todo/${todo.id}/edit`}>
                        <Button className="btn-soft" size="sm">
                            <FiEdit2 />
                            수정
                        </Button>
                    </Link>
                    {/* 서버 컴포넌트 안에 클라이언트 컴포넌트를 넣고, 필요한 값만 Props로 전달합니다. */}
                    <DeleteTodoButton id={todo.id} title={todo.title} />
                </div>
            </div>
            <h1 className="font-cute mb-4 break-all text-2xl text-[#65564B]">{todo.title}</h1>

            <dl className="mb-6 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <dt>마감일</dt>
                <DueDateBadge id={todo.id} />
                <dt>작성일</dt>
                <dd>{formatDate(todo.createdAt)}</dd>
                <dt>수정일</dt>
                <dd>{formatDate(todo.updatedAt)}</dd>
            </dl>

            <TodoContentViewer content={todo.content} />
        </article>
    );
}
