'use client';

import Link from 'next/link';
import { AnimatedLogo } from './AnimatedLogo';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <AnimatedLogo />
          <span className="font-bold font-headline">Valutify</span>
        </Link>
        <nav className="flex items-center gap-4">
        </nav>
      </div>
    </header>
  );
}
