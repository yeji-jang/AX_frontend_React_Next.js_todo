import SignInForm from '@/domains/auth/components/SignInForm';
export default function SignInPage(): React.JSX.Element {
    return (
        <div className="paper-panel mx-auto max-w-md p-6 sm:p-8">
            <h1 className="font-cute mb-1 text-2xl text-[#65564B]">🐰 다시 만나서 반가워요!</h1>
            <p className="mb-6 text-sm text-[#75655A]">로그인하면 토끼가 할 일을 배달해 드려요.</p>
            <SignInForm />
        </div>
    );
}
