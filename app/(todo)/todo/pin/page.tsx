'use client';
// 찜한 id 목록이 브라우저 저장소(localStorage)에 있으므로 클라이언트 컴포넌트입니다.
// id를 읽은 뒤 usePinnedTodos 훅(useEffect)으로 Supabase에서 최신 정보를 불러옵니다.

import { TODO_STATUS_MAP } from '@/domains/todo/constants/todoStatus';
import { usePinnedTodos } from '@/domains/todo/hooks/usePinnedTodos';
import { usePinStore } from '@/domains/todo/stores/usePinStore';
import EmptyState from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { FiAlertCircle } from 'react-icons/fi';
import { useShallow } from 'zustand/react/shallow';

export default function TodoPinPage() {
    const _hasHydrated = usePinStore((state) => state._hasHydrated);
    const removePin = usePinStore((state) => state.remove);
    // 저장소에서는 id만 꺼냅니다. (제목 등은 옛날 정보일 수 있어서 Supabase에서 새로 불러옵니다)
    // useShallow: 배열 내용이 같으면 같은 값으로 취급해 불필요한 리렌더링을 막습니다.
    const pinnedIds = usePinStore(
        useShallow((state) => state.items.map((item) => item.id)),
    );

    // 저장소를 다 읽기 전에는 빈 배열을 넘겨서 요청하지 않습니다.
    const { status, todos, retry } = usePinnedTodos(
        _hasHydrated ? pinnedIds : [],
    );

    // ⏳ 로딩: 브라우저 저장소를 읽는 중이거나, Supabase에서 불러오는 중
    if (!_hasHydrated || status === 'loading') {
        return (
            <div role="status" className="space-y-3 p-4">
                <p className="text-sm text-muted-foreground">
                    찜 목록을 불러오는 중...
                </p>
                {[1, 2].map((n) => (
                    <div
                        key={n}
                        className="h-14 animate-pulse rounded-2xl bg-muted"
                    />
                ))}
            </div>
        );
    }

    // ❌ 오류
    if (status === 'error') {
        return (
            <div
                role="alert"
                className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-600"
            >
                <FiAlertCircle className="h-8 w-8" />
                <p className="font-medium">찜 목록을 불러오지 못했어요.</p>
                <Button variant="outline" onClick={retry}>
                    다시 시도
                </Button>
            </div>
        );
    }

    // 📭 빈 데이터: 찜한 게 없거나, 찜한 할 일이 모두 삭제된 경우
    if (todos.length === 0) {
        return (
            <EmptyState
                title="찜한 할 일이 없어요."
                description="할 일 목록에서 '찜하기'를 눌러 보세요."
                actionHref="/"
                actionLabel="할 일 목록으로"
            />
        );
    }

    // ✅ 성공: 목록 렌더링 (key는 할 일의 고유 id)
    return (
        <div className="paper-panel mx-auto max-w-2xl space-y-4 p-5 sm:p-8">
            <h1 className="font-cute text-2xl text-[#65564B]">💖 찜한 편지 ({todos.length})</h1>
            <ul className="space-y-2">
                {todos.map((todo) => (
                    <li
                        key={todo.id}
                        className="flex items-center justify-between gap-2 rounded-2xl bg-[#FFFAF0] p-4 shadow-[0_3px_8px_rgb(101_86_75/0.08)]"
                    >
                        <Link
                            href={`/todo/${todo.id}/view`}
                            className="flex items-center gap-2 hover:underline"
                        >
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                                {TODO_STATUS_MAP[todo.status]}
                            </span>
                            {todo.title}
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePin(todo.id)}
                        >
                            찜해제
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
