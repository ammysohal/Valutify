'use client';

import Link from 'next/link';
import { AnimatedLogo } from './AnimatedLogo';
import { useUser } from '@/firebase';
import { Button } from './ui/button';
import { getAuth, signOut } from 'firebase/auth';

export default function Header() {
  const { user, isUserLoading } = useUser();

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <AnimatedLogo />
          <span className="font-bold font-headline">Valutify</span>
        </Link>
        <nav className="flex items-center gap-4">
          {isUserLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
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
