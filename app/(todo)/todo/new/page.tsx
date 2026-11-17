import TodoForm from '@/domains/todo/components/TodoForm';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';

export default function AddTodoPage(): React.JSX.Element {
    return (
        <div className="mx-auto max-w-2xl space-y-4">
            <Link href="/">
                <Button className="btn-soft">← 마을로 돌아가기</Button>
            </Link>
            <div className="paper-panel p-5 sm:p-8">
                <h1 className="font-cute mb-1 text-2xl text-[#65564B]">💌 토끼에게 할 일 맡기기</h1>
                <p className="mb-6 text-sm text-[#75655A]">
                    편지를 쓰면 토끼가 우체통에서 꺼내 구름 위로 배달해 드려요.
                </p>
                <TodoForm />
            </div>
        </div>
    );
}
