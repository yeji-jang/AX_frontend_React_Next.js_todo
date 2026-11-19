import type { DecorId, HatId, PaperId } from '@/domains/shop/types/shop.types';

/** 이메일 검색 결과에서 나와의 관계 */
export type FriendRelation = 'self' | 'none' | 'friend' | 'sent' | 'received';

export interface FoundProfile {
    userId: string;
    name: string;
    relation: FriendRelation;
}

/** 친구 · 신청 한 줄 (id는 friendships 테이블의 id) */
export interface FriendRequest {
    id: string;
    userId: string;
    name: string;
    since: string;
}

export interface Friend extends FriendRequest {
    hat: HatId;
    stars: number;
}

export interface FriendOverview {
    friends: Friend[];
    received: FriendRequest[];
    sent: FriendRequest[];
}

export interface GuestbookEntry {
    id: string;
    authorId: string;
    authorName: string;
    message: string;
    createdAt: string;
}

/** 놀러 간 마을 (할 일 내용은 없고 개수만 있어요) */
export interface VillageVisit {
    userId: string;
    name: string;
    isMe: boolean;
    hat: HatId;
    paper: PaperId;
    decor: DecorId[];
    stars: number;
    activeCount: number;
    doneCount: number;
    guestbook: GuestbookEntry[];
}
