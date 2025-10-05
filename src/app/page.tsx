'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import FloatingCubes from '@/components/three/FloatingCubes';

export default function Home() {
  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center overflow-hidden">
      <FloatingCubes />
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-white animate-fade-in-down">
          Welcome to Valutifyz
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl text-muted-foreground animate-fade-in-up">
          Solve a shortlink to instantly claim your free Minecraft Premium account.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="bg-primary/90 hover:bg-primary text-primary-foreground glowing-box transition-all duration-300 transform hover:scale-105">
            <Link href="/generate">Generate Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
