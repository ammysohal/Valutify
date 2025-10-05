import { claimAccount } from '@/lib/actions';
import AccountCard from '@/components/AccountCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import Celebration from '@/components/Celebration';
import type { SerializableAccount } from '@/lib/actions';


export const revalidate = 0; // Don't cache this page


export default async function ClaimPage() {
  const { data: account, error } = await claimAccount();

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12">
      {account && <Celebration animationType="confetti" />}
      <div className="w-full max-w-md">
        {error ? (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : account ? (
          <>
            <div className="text-center mb-6">
              <h1 className="font-headline text-3xl font-bold text-green-400">
                ✅ Your Minecraft Premium Account Has Been Generated!
              </h1>
              <p className="text-muted-foreground mt-2">Enjoy your new account. Copy the credentials below.</p>
            </div>
            <AccountCard account={account as SerializableAccount} />
          </>
        ) : (
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Processing</AlertTitle>
            <AlertDescription>
              Please wait while we generate your account. This may take a moment.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
