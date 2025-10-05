import SignupForm from '@/components/SignupForm';

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 animate-in">
      <div className="w-full max-w-md animate-fade-in-up">
        <SignupForm />
      </div>
    </div>
  );
}
