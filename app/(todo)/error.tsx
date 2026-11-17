'use client'; // 오류 화면은 "다시 시도" 버튼 클릭을 처리해야 하므로 반드시 클라이언트 컴포넌트입니다.

import BunnyCharacter from '@/domains/todo/components/bunny/BunnyCharacter';
import { Button } from '@/shared/components/ui/button';
import { useEffect } from 'react';

interface TodoErrorProps {
    /** 페이지에서 throw된 값 (Error가 아닐 수도 있어서 unknown) */
    error: unknown;
    /** 페이지를 다시 불러오는 함수 (Next.js 16에서는 reset 대신 retry) */
    retry: () => void;
}

// (todo) 폴더 안의 페이지에서 오류가 발생하면 자동으로 이 화면이 대신 보여집니다.
export default function TodoError({
    error,
    retry,
}: TodoErrorProps): React.JSX.Element {
    // error가 바뀔 때만 콘솔에 기록합니다. (의존성 배열 [error])
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div role="alert" className="paper-panel flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="w-[96px]">
                <BunnyCharacter expression="worried" holding="newspaper" className="h-auto w-full" />
            </div>
            <p className="font-cute text-xl text-[#65564B]">앗, 편지가 길을 잃었어요!</p>
            <p className="text-sm text-[#75655A]">
                잠시 후 다시 시도해 주세요. 문제가 계속되면 새로고침해 주세요.
            </p>
            <Button className="btn-bunny mt-2" onClick={() => retry()}>
                🔄 다시 시도
            </Button>
        </div>
    );
}
