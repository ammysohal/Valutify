'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const handleGenerate = () => {
    setLoading(true);

    setTimeout(() => {
      // The user must solve the shortlink to be redirected to this URL.
      // A unique timestamp prevents caching issues.
      const claimUrl = `${window.location.origin}/claim?t=${Date.now()}`;
      
      // This is the shortlink URL the user will be sent to.
      // The URL is passed directly without extra encoding.
      const linkPaysUrl = `https://linkpays.in/st?api=3295db9608441da32b8049d61b1675cde9802c5d&url=${claimUrl}`;
      
      setRedirecting(true);
      // Redirect the user to the shortlink service.
      window.location.href = linkPaysUrl;
    }, 1500);
  };

  return (
    <div className="container flex flex-col items-center justify-center text-center py-20 md:py-32">
      <div className="w-full max-w-2xl">
        <div className="relative p-8 border rounded-lg glowing-box glassmorphism">
          <div className="absolute -top-3 -left-3 w-12 h-12 bg-primary rounded-full blur-xl opacity-50"></div>
          <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-secondary rounded-full blur-xl opacity-50"></div>
          
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-white">
            Generate Your Account
          </h1>
          <p className="mt-4 text-muted-foreground">
            Click the button below to solve a shortlink and claim your Minecraft Premium account.
          </p>
          <div className="mt-8">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              size="lg"
              className="w-full h-16 text-xl font-bold bg-primary/90 hover:bg-primary text-primary-foreground glowing-box transition-all duration-300 transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Spinner />
                  <span>{redirecting ? 'Redirecting...' : 'Generating link...'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Generate Account</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
