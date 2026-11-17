'use client';

import TiptabEditor from '@/shared/components/TiptabEditor';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
    INITIAL_ACTION_STATE,
    type ActionState,
} from '@/shared/types/action.types';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useActionState, useEffect, useState } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { addTodoAction, updateTodoAction } from '../actions/todo.actions';
import { useBunnyStore } from '../stores/useBunnyStore';
import { useDueDateStore } from '../stores/useDueDateStore';
import { isValidDueDate } from '../utils/deadlineUtils';
import type { Todo } from '../types/todo.types';

interface FormState {
    title: string;
    content: string;
}

interface TodoFormProps {
    /**
     * 수정할 할 일. 넘기면 "수정 모드", 넘기지 않으면 "등록 모드"로 동작합니다.
     * 폼에 필요한 값(id, title, content)만 받도록 Pick으로 타입을 좁혔습니다.
     */
    todo?: Pick<Todo, 'id' | 'title' | 'content'>;
}

// 할 일 등록 / 수정 겸용 폼
//   <TodoForm />               → 등록
//   <TodoForm todo={todo} />   → 수정 (기존 값이 채워진 상태로 시작)
export default function TodoForm({ todo }: TodoFormProps) {
    const router = useRouter();
    const isEditMode = todo !== undefined;

    // 마감일은 브라우저에 저장합니다. (기존 DB 구조를 바꾸지 않기 위해)
    const dueHydrated = useDueDateStore((state) => state._hasHydrated);
    const storedDueDate = useDueDateStore((state) =>
        todo ? state.dueDates[todo.id] : undefined,
    );
    const setDueDate = useDueDateStore((state) => state.setDueDate);
    const removeDueDate = useDueDateStore((state) => state.removeDueDate);
    const enqueueDelivery = useBunnyStore((state) => state.enqueueDelivery);
    // 사용자가 직접 고친 값 (아직 안 고쳤으면 null → 저장된 값을 보여줌)
    const [dueInput, setDueInput] = useState<string | null>(null);
    const dueValue = dueInput ?? (dueHydrated ? (storedDueDate ?? '') : '');

    // 모드에 따라 사용할 Server Action을 고릅니다. (두 Action은 모양이 같습니다)
    // Server Action은 그대로 두고, 결과를 받은 뒤 브라우저 쪽 일만 덧붙입니다.
    //  - 저장 성공 시에만 마감일을 기록하고, 새 할 일이면 토끼 배달 대기열에 넣어요.
    //  - 저장 실패 시에는 아무 애니메이션도 시작하지 않아요.
    const [state, formAction, isPending] = useActionState(
        async (prevState: ActionState, formData: FormData) => {
            const serverAction = isEditMode ? updateTodoAction : addTodoAction;
            const result = await serverAction(prevState, formData);
            const savedId = (result.data as { id?: string } | undefined)?.id;

            if (result.success && savedId) {
                const dueDate = String(formData.get('dueDate') ?? '');
                if (isValidDueDate(dueDate)) {
                    setDueDate(savedId, dueDate);
                } else {
                    removeDueDate(savedId);
                }

                if (!isEditMode) {
                    enqueueDelivery({
                        id: savedId,
                        title: String(formData.get('title') ?? '').trim(),
                        dueDate: isValidDueDate(dueDate) ? dueDate : undefined,
                    });
                }
            }
            return result;
        },
        INITIAL_ACTION_STATE,
    );

    // 수정 모드면 기존 값으로, 등록 모드면 빈 값으로 시작합니다.
    const [form, setForm] = useState<FormState>({
        title: todo?.title ?? '',
        content: todo?.content ?? '',
    });

    const onChange = (e: ChangeEvent<HTMLInputElement> | string) => {
        setForm((prev) => {
            // Tiptap 에디터는 문자열(HTML)을, input은 이벤트 객체를 넘겨줍니다.
            if (typeof e === 'string') {
                return { ...prev, content: e };
            }
            return { ...prev, [e.target.name]: e.target.value };
        });
    };

    // 저장이 끝나면 이동할 주소: 등록 → 목록, 수정 → 그 할 일의 상세 페이지
    const redirectTo = isEditMode ? `/todo/${todo.id}/view` : '/';

    // state.success가 true로 바뀌었을 때만 실행됩니다. (의존성 배열에 사용하는 값을 모두 넣음)
    useEffect(() => {
        if (state.success) {
            router.replace(redirectTo);
            router.refresh();
        }
    }, [state.success, redirectTo, router]);

    return (
        <div>
            {state.message && !state.success && (
                <div role="alert" className="form-alert mb-6">
                    <FiAlertCircle className="h-4 w-4 shrink-0" />
                    <span>{state.message}</span>
                </div>
            )}
            <form action={formAction} noValidate autoComplete="off" className="space-y-5">
                {/* 수정 모드에서는 어떤 할 일을 고칠지 알려주기 위해 id를 함께 보냅니다. */}
                {isEditMode && <input type="hidden" name="id" value={todo.id} />}
                <input type="hidden" name="content" value={form.content} />

                <div className="form-field">
                    <label htmlFor="todo-title" className="form-label">
                        ✏️ 할 일
                    </label>
                    <Input
                        id="todo-title"
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={onChange}
                        className="form-input"
                        placeholder="토끼에게 맡길 할 일을 적어 주세요"
                    />
                    {state.errors?.title && (
                        <p className="form-error">
                            <FiAlertCircle />
                            {state.errors.title}
                        </p>
                    )}
                </div>

                <div className="form-field">
                    <label htmlFor="todo-due" className="form-label">
                        📅 마감일 <span className="text-xs font-normal opacity-70">(선택)</span>
                    </label>
                    <Input
                        id="todo-due"
                        type="date"
                        name="dueDate"
                        value={dueValue}
                        onChange={(e) => setDueInput(e.target.value)}
                        className="form-input w-auto"
                    />
                    <p className="text-xs text-[#75655A]">
                        마감 3일 전부터 토끼가 신문을 뿌려 알려줘요. (마감일은 이 브라우저에 저장돼요)
                    </p>
                </div>

                <div className="form-field">
                    <span className="form-label">📝 내용</span>
                    <div className="form-editor">
                        <TiptabEditor content={form.content} onChange={onChange} />
                    </div>
                    {state.errors?.content && (
                        <p className="form-error">
                            <FiAlertCircle />
                            {state.errors.content}
                        </p>
                    )}
                </div>

                <Button type="submit" disabled={isPending} className="btn-bunny w-full sm:w-auto">
                    {isPending
                        ? '저장 중...'
                        : isEditMode
                          ? '✏️ 수정하기'
                          : '💌 토끼에게 맡기기'}
                </Button>
            </form>
        </div>
    );
}
