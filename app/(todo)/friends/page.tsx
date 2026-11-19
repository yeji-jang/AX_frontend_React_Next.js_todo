import { getCurrentUser } from '@/domains/auth/queries/getCurrentUser.query';
import FriendLists from '@/domains/friend/components/FriendLists';
import FriendSearch from '@/domains/friend/components/FriendSearch';
import { getFriendOverview } from '@/domains/friend/queries/friend.queries';
import { Button } from '@/shared/components/ui/button';
import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';

// 로그인한 사람마다 내용이 달라서 요청 시점에 그려요 (메인 페이지와 같은 방식)
export const instant = false;

export const metadata: Metadata = {
    title: '친구 · Bunny Post',
};

// 친구 찾기 · 친구 신청 · 친구 목록
export default async function FriendsPage(): Promise<React.JSX.Element> {
    // 로그인 세션(쿠키)을 읽으므로 요청 시점에 렌더링해요.
    await connection();
    const [{ user }, overview] = await Promise.all([getCurrentUser(), getFriendOverview()]);

    return (
        <div className="mx-auto max-w-3xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href="/">
                    <Button className="btn-soft">← 마을로 돌아가기</Button>
                </Link>
                {user && (
                    <Link href={`/village/${user.id}`}>
                        <Button className="btn-soft">📖 내 방명록 보기</Button>
                    </Link>
                )}
            </div>
            <h1 className="font-cute text-3xl text-[#65564B]">👫 친구</h1>
            <FriendSearch />
            <FriendLists overview={overview} />
        </div>
    );
}
