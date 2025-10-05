
'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useAuth } from '@/firebase';
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { useSearchParams } from 'next/navigation';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Copy, Check } from 'lucide-react';
import Celebration from '@/components/Celebration';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type Account = {
  id: string;
  email: string;
  password?: string;
  status: 'unclaimed' | 'claimed';
  timestamp: Timestamp;
};

export type SerializableAccount = Omit<Account, 'timestamp'> & {
  timestamp: string;
};

export default function ClaimPage() {
  const [account, setAccount] = useState<SerializableAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  const handleCopy = (text: string, field: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast({
      title: 'Copied to clipboard!',
    });
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        signInAnonymously(auth).catch((authError) => {
          console.error('Anonymous sign-in failed:', authError);
          setError(`Authentication failed: ${authError.message}`);
          setLoading(false);
        });
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!user || !firestore) return;

    const claimToken = searchParams.get('token');

    if (!claimToken) {
      setError('Invalid claim request. No token provided.');
      setLoading(false);
      return;
    }

    const claim = async () => {
      setLoading(true);
      try {
        // 1. Verify the token
        const tokensRef = collection(firestore, 'claim_tokens');
        const tokenQuery = query(
          tokensRef,
          where('token', '==', claimToken),
          where('userId', '==', user.uid),
          where('used', '==', false),
          limit(1)
        );
        const tokenSnapshot = await getDocs(tokenQuery);

        if (tokenSnapshot.empty) {
          setError('Invalid or expired claim token. Please try generating a new one.');
          setLoading(false);
          return;
        }

        const tokenDoc = tokenSnapshot.docs[0];

        // 2. Find an unclaimed account
        const accountsRef = collection(firestore, 'minecraft_accounts');
        const q = query(
          accountsRef,
          where('status', '==', 'unclaimed'),
          limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('No unclaimed accounts available. Please try again later.');
          setLoading(false);
          return;
        }

        const accountDoc = querySnapshot.docs[0];
        const accountData = { id: accountDoc.id, ...accountDoc.data() } as Account;
        
        // 3. Use a batch write to claim the account and consume the token
        const batch = writeBatch(firestore);

        // Mark account as claimed
        const accountRef = doc(firestore, 'minecraft_accounts', accountDoc.id);
        batch.update(accountRef, {
            status: 'claimed',
            timestamp: serverTimestamp(),
            claimedBy: user.uid,
        });

        // Mark token as used
        const tokenRef = doc(firestore, 'claim_tokens', tokenDoc.id);
        batch.update(tokenRef, { used: true });

        await batch.commit();

        const finalTimestamp = Timestamp.now();

        const returnData: SerializableAccount = {
          id: accountData.id,
          email: accountData.email,
          password: accountData.password,
          status: 'claimed',
          timestamp: finalTimestamp.toDate().toISOString(),
        };

        setAccount(returnData);
      } catch (err: any) {
        console.error('Error claiming account:', err);
        setError(`Failed to claim account: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    claim();
  }, [user, firestore, searchParams]);

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 animate-in">
      {account && <Celebration animationType="confetti" />}
      <div className="w-full max-w-md">
        {loading ? (
          <div className="flex flex-col items-center gap-4 text-center animate-fade-in-up">
            <Spinner className="h-8 w-8" />
            <Alert>
              <AlertTitle>Processing</AlertTitle>
              <AlertDescription>
                Please wait while we generate your account. This may take a moment.
              </AlertDescription>
            </Alert>
          </div>
        ) : error ? (
          <Alert className="text-white border-white bg-transparent animate-fade-in-up">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : account ? (
          <>
            <div className="text-center mb-6 animate-fade-in-down">
              <h1 className="font-headline text-2xl md:text-3xl font-bold text-white">
                ✅ Your Minecraft Premium Account Has Been Generated!
              </h1>
              <p className="text-muted-foreground mt-2">
                Enjoy your new account. Copy the credentials below.
              </p>
            </div>
            <Card className="glassmorphism glowing-box animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-center font-headline text-2xl">
                  Your Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input id="email" value={account.email} readOnly className="pr-12" />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 transition-transform duration-300 hover:scale-110"
                      onClick={() => handleCopy(account.email, 'email')}
                    >
                      {copied === 'email' ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      value={account.password}
                      readOnly
                      className="pr-12"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 transition-transform duration-300 hover:scale-110"
                      onClick={() =>
                        handleCopy(account.password || '', 'password')
                      }
                    >
                      {copied === 'password' ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Alert className="animate-fade-in-up">
            <AlertTitle>No Account Found</AlertTitle>
            <AlertDescription>
              We could not find an available account. Please try again later.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
