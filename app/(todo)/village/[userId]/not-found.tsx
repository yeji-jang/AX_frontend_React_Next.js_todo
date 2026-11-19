import EmptyState from '@/shared/components/EmptyState';

// 친구가 아니거나 없는 사용자의 마을에 들어왔을 때
export default function VillageNotFound(): React.JSX.Element {
    return (
        <EmptyState
            title="이 마을에는 들어갈 수 없어요."
            description="친구가 된 토끼의 마을에만 놀러 갈 수 있어요."
            actionHref="/friends"
            actionLabel="친구 목록으로"
        />
    );
}
