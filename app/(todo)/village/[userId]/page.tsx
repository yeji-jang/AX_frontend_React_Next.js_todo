import { getCurrentUser } from '@/domains/auth/queries/getCurrentUser.query';
import FriendVillage from '@/domains/friend/components/FriendVillage';
import Guestbook from '@/domains/friend/components/Guestbook';
import { getVillageVisit } from '@/domains/friend/queries/friend.queries';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

// 로그인한 사람마다 내용이 달라서 요청 시점에 그려요 (메인 페이지와 같은 방식)
export const instant = false;

// 친구 마을 놀러가기: /village/{친구 id}
// 친구가 아니거나 없는 사용자면 404 화면을 보여줘요. (DB 함수가 친구 관계를 확인해요)
export default async function VillagePage({
    params,
}: PageProps<'/village/[userId]'>): Promise<React.JSX.Element> {
    await connection();
    const { userId } = await params;
    const [{ user }, visit] = await Promise.all([getCurrentUser(), getVillageVisit(userId)]);

    if (!visit || !user) notFound();

    return (
        <div className="mx-auto max-w-5xl space-y-5">
            <div className="flex flex-wrap items-center gap-2">
                <Link href="/friends">
                    <Button className="btn-soft">← 친구 목록</Button>
                </Link>
                <Link href="/">
                    <Button className="btn-soft">🏠 내 마을로</Button>
                </Link>
            </div>
            <FriendVillage visit={visit} />
            <Guestbook ownerId={visit.userId} viewerId={user.id} isMe={visit.isMe} entries={visit.guestbook} />
        </div>
    );
}
