'use client';

import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';

export function Providers({ children }: { children: React.ReactNode }) {
  
  const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
  };
  
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
        <Toaster />
    </ThemeProvider>
  );
}
