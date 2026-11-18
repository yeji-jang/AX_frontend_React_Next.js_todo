import SignOutButton from '@/domains/auth/components/SignOutButton';
import CarrotWallet from '@/domains/shop/components/CarrotWallet';
import { getCurrentUser } from '@/domains/auth/queries/getCurrentUser.query';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { connection } from 'next/server';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';

export default async function Header(): Promise<React.JSX.Element> {
    // 세션/쿠키를 읽기 전 요청 연결을 기다림 (Date.now 오류 해결)
    await connection();
    const { user } = await getCurrentUser();

    return (
        <header className="paper-panel mb-5 mt-4 flex items-center justify-between gap-2 px-4 py-3 sm:px-6">
            {/* 로고: 누르면 할 일 목록(홈)으로 이동 */}
            <Link href="/" className="flex min-w-0 items-baseline gap-2">
                <span className="font-cute text-xl text-[#65564B] sm:text-2xl">🐰 Bunny Post</span>
                <span className="hidden text-xs text-[#75655A] md:inline">
                    오늘의 할 일을 배달해 드려요
                </span>
            </Link>
            <div className="flex shrink-0 items-center gap-2 text-sm">
                {user ? (
                    <>
                        <CarrotWallet />
                        <FiUser className="hidden h-3.5 w-3.5 text-[#A98268] sm:block" />
                        <span className="hidden sm:inline">{user.name}님</span>
                        <SignOutButton />
                    </>
                ) : (
                    <>
                        <Link href="/sign_in">
                            <Button
                                variant="outline"
                                className="cursor-pointer"
                            >
                                <FaSignInAlt /> 로그인
                            </Button>
                        </Link>
                        <Link href="/sign_up">
                            <Button
                                variant="secondary"
                                className="ml-1 cursor-pointer"
                            >
                                <FaUserPlus /> 회원가입
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}
