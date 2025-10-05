import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 animate-in">
      <div className="w-full max-w-md animate-fade-in-up">
        <LoginForm />
      </div>
    </div>
  );
}
