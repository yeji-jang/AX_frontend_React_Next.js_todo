import SignUpForm from '@/domains/auth/components/SignUpForm';

export default function signUpPage(): React.JSX.Element {
    return (
        <div className="paper-panel mx-auto max-w-md p-6 sm:p-8">
            <h1 className="font-cute mb-1 text-2xl text-[#65564B]">💌 Bunny Post에 오신 걸 환영해요</h1>
            <p className="mb-6 text-sm text-[#75655A]">가입하고 나만의 작은 할 일 마을을 만들어 보세요.</p>
            <SignUpForm />
        </div>
    );
}
