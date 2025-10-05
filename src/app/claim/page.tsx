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
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';

import AccountCard from '@/components/AccountCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Copy, Check } from 'lucide-react';
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
                console.error("Anonymous sign-in failed:", authError);
                setError(`Authentication failed: ${authError.message}`);
                setLoading(false);
            });
        }
    });

    return () => unsubscribe();
  }, [auth]);


  useEffect(() => {
    if (!user || !firestore) return;

    const claim = async () => {
        setLoading(true);
        try {
            const accountsRef = collection(firestore, 'minecraft_accounts');
            const q = query(accountsRef, where('status', '==', 'unclaimed'), limit(1));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError('No unclaimed accounts available. Please try again later.');
                setLoading(false);
                return;
            }

            const accountDoc = querySnapshot.docs[0];
            const accountData = { id: accountDoc.id, ...accountDoc.data() } as Account;

            await updateDoc(doc(firestore, 'minecraft_accounts', accountDoc.id), {
                status: 'claimed',
                timestamp: serverTimestamp(),
            });

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

  }, [user, firestore]);

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12">
      {account && <Celebration animationType="confetti" />}
      <div className="w-full max-w-md">
        {loading ? (
          <div className="flex flex-col items-center gap-4 text-center">
             <Spinner className="h-8 w-8" />
             <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Processing</AlertTitle>
                <AlertDescription>
                  Please wait while we generate your account. This may take a moment.
                </AlertDescription>
              </Alert>
          </div>
        ) : error ? (
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
             <Card className="glassmorphism glowing-box">
                <CardHeader>
                    <CardTitle className="text-center font-headline text-2xl">Your Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Input id="email" value={account.email} readOnly />
                        <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => handleCopy(account.email, 'email')}
                        >
                        {copied === 'email' ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input id="password" type="password" value={account.password} readOnly />
                        <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => handleCopy(account.password || '', 'password')}
                        >
                        {copied === 'password' ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    </div>
                </CardContent>
            </Card>
          </>
        ) : (
            <Alert>
                <Terminal className="h-4 w-4" />
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
