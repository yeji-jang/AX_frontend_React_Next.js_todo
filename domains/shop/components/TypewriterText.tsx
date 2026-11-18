'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

const CHAR_MS = 32;

/**
 * 한 글자씩 또박또박 나타나는 대사
 * 대사가 바뀌면 부모가 key를 바꿔서 처음부터 다시 시작해요.
 * 화면 읽기 프로그램에는 처음부터 전체 문장을 알려 줘요.
 */
export default function TypewriterText({ text }: { text: string }) {
    const reduceMotion = useReducedMotion();
    const [shown, setShown] = useState(0);

    useEffect(() => {
        if (reduceMotion) return;
        const timer = setInterval(() => {
            setShown((n) => {
                if (n >= text.length) {
                    clearInterval(timer);
                    return n;
                }
                return n + 1;
            });
        }, CHAR_MS);
        return () => clearInterval(timer);
    }, [text, reduceMotion]);

    const visible = reduceMotion ? text : text.slice(0, shown);

    return (
        <>
            <span className="sr-only">{text}</span>
            <span aria-hidden>
                {visible}
                {/* 글자 자리를 미리 잡아 두어서 말풍선 크기가 덜컹거리지 않아요. */}
                <span className="invisible">{text.slice(visible.length)}</span>
            </span>
        </>
    );
}
