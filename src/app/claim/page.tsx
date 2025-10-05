import { claimAccount, Account } from '@/lib/actions';
import AccountCard from '@/components/AccountCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import Celebration from '@/components/Celebration';
import { Timestamp } from 'firebase/firestore';

export const revalidate = 0; // Don't cache this page

// Define a serializable account type for the client
type SerializableAccount = Omit<Account, 'timestamp'> & {
  timestamp: string;
};


export default async function ClaimPage() {
  const { data, error } = await claimAccount();

  const account : SerializableAccount | null = data ? {
      ...data,
      timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : data.timestamp
  } : null;

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
            <AccountCard account={account as Account} />
          </>
        ) : (
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Processing</AlertTitle>
            <AlertDescription>
              Please wait while we generate your account.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
