'use client';

import Link from 'next/link';
import { AnimatedLogo } from './AnimatedLogo';
import { useUser, useAuth } from '@/firebase';
import { Button } from './ui/button';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Spinner } from './ui/spinner';

const ADMIN_EMAIL = 'amnindersohal10@gmail.com';

export default function Header() {
  const { user, isUserLoading: loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <AnimatedLogo />
          <span className="font-bold font-headline">Valutify</span>
        </Link>
        <nav className="flex items-center gap-4">
          {loading ? (
            <Spinner />
          ) : user ? (
            <>
              {user.email === ADMIN_EMAIL && (
                <Button asChild variant="outline">
                  <Link href="/admin">Dashboard</Link>
                </Button>
              )}
              <Button variant="ghost" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
