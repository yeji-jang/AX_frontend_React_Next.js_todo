import BunnyCharacter from '@/domains/todo/components/bunny/BunnyCharacter';

// (todo) 폴더 안의 페이지가 서버에서 데이터를 불러오는 동안 자동으로 보여지는 화면입니다.
// Next.js가 page.tsx를 <Suspense fallback={<Loading />}>로 감싸 주기 때문에
// 직접 로딩 상태(useState)를 관리하지 않아도 됩니다.
export default function Loading(): React.JSX.Element {
    return (
        <div
            role="status"
            aria-live="polite"
            className="paper-panel flex flex-col items-center gap-3 px-6 py-12 text-center"
        >
            <div className="loading-hop w-[90px]">
                <BunnyCharacter expression="happy" holding="letter" hopping className="h-auto w-full" />
            </div>
            <p className="font-cute text-lg text-[#65564B]">토끼가 편지를 가져오는 중이에요…</p>

            {/* 실제 카드와 비슷한 모양의 자리(스켈레톤)로 화면이 덜컹거리지 않게 합니다. */}
            <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((n) => (
                    <div key={n} className="h-24 animate-pulse rounded-3xl bg-[#F5ECDC]" />
                ))}
            </div>
        </div>
    );
}
