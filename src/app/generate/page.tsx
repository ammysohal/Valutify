
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useFirestore, useAuth } from '@/firebase';
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { v4 as uuidv4 } from 'uuid';

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [inStock, setInStock] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const firestore = useFirestore();
  const auth = useAuth();

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        signInAnonymously(auth).catch((authError) => {
          console.error('Anonymous sign-in failed:', authError);
        });
      }
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!firestore) return;

    const checkStock = async () => {
      try {
        const accountsRef = collection(firestore, 'minecraft_accounts');
        const q = query(
          accountsRef,
          where('status', '==', 'unclaimed'),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        setInStock(!querySnapshot.empty);
      } catch (error) {
        console.error('Error checking stock:', error);
        setInStock(false); // Assume out of stock on error
      }
    };

    checkStock();
  }, [firestore]);

  const handleGenerate = async () => {
    if (!inStock || !firestore || !user) return;

    setLoading(true);

    try {
      // 1. Generate a unique, single-use token
      const claimToken = uuidv4();

      // 2. Store the token in Firestore with the user's UID
      const tokensRef = collection(firestore, 'claim_tokens');
      await addDoc(tokensRef, {
        userId: user.uid,
        token: claimToken,
        createdAt: serverTimestamp(),
        used: false,
      });

      // 3. Construct the claim URL with the token
      const claimUrl = `${window.location.origin}/claim?token=${claimToken}`;
      
      // 4. Construct the shortlink URL
      const linkPaysUrl = `https://linkpays.in/st?api=3295db9608441da32b8049d61b1675cde9802c5d&url=${claimUrl}`;

      // 5. Redirect the user
      setRedirecting(true);
      window.location.href = linkPaysUrl;

    } catch (error) {
      console.error("Error generating claim token:", error);
      setLoading(false);
      // Optionally, show an error toast to the user
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center text-center py-20 md:py-32">
      <div className="w-full max-w-2xl">
        <div className="relative p-4 md:p-8 border rounded-lg">
          <div className="absolute -top-3 -left-3 w-12 h-12 bg-primary rounded-full blur-xl opacity-50"></div>
          <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-secondary rounded-full blur-xl opacity-50"></div>

          <h1 className="font-headline text-4xl md:text-5xl font-bold text-white">
            Generate Your Account
          </h1>
          <p
            className="mt-4 text-muted-foreground"
          >
            Click The Button Below To Solve A Shortlink And Claim Your Minecraft
            Premium Account
          </p>
          <div className="mt-8">
            {inStock === null ? (
              <div
                className="flex items-center justify-center gap-2"
              >
                <Spinner />
                <span>Checking for available accounts...</span>
              </div>
            ) : inStock === false ? (
              <Alert
                className="text-white border-white bg-transparent"
              >
                <AlertTitle>Out of Stock!</AlertTitle>
                <AlertDescription>
                  Sorry, there are no accounts available right now. Please check
                  back later.
                </AlertDescription>
              </Alert>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={loading || !inStock || !authInitialized || !user}
                size="lg"
                className="w-full h-14 md:h-16 text-lg md:text-xl font-bold bg-primary/90 hover:bg-primary text-primary-foreground"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Spinner />
                    <span>
                      {redirecting ? 'Redirecting...' : 'Generating link...'}
                    </span>
                  </div>
                ) : !authInitialized ? (
                   <div className="flex items-center gap-2">
                    <Spinner />
                    <span>Initializing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Generate Account</span>
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
