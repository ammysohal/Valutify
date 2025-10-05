import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/Providers';
import Header from '@/components/Header';
import { FirebaseClientProvider } from '@/firebase';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: 'Valutifyz - Generate Minecraft Premium Accounts',
  description: 'Solve a shortlink to instantly claim your free Minecraft Premium account.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          'font-body antialiased',
          fontBody.variable,
          fontHeadline.variable
        )}
      >
        <FirebaseClientProvider>
          <Providers>
            <div className="relative min-h-screen bg-background">
              <Header />
              <main>{children}</main>
            </div>
          </Providers>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
