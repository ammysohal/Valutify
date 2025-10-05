'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, where, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { analyzeAccountDistribution } from '@/ai/flows/analyze-account-distribution';

const ADMIN_EMAIL = 'amninderoshal10@gmail.com';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState({ lifetime: 0, today: 0 });
  const [accounts, setAccounts] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [analysis, setAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  async function fetchStats() {
    setLoadingStats(true);
    try {
      const accountsRef = collection(db, 'accounts');
      const allClaimedSnapshot = await getDocs(query(accountsRef, where('status', '==', 'claimed')));

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);

      const todayClaimedSnapshot = await getDocs(
        query(
          accountsRef,
          where('status', '==', 'claimed'),
          where('timestamp', '>=', todayTimestamp)
        )
      );

      setStats({
        lifetime: allClaimedSnapshot.size,
        today: todayClaimedSnapshot.size,
      });
    } catch (error) {
      console.error('Error fetching stats: ', error);
      toast({
        title: 'Error',
        description: 'Could not fetch stats.',
        variant: 'destructive',
      });
    } finally {
      setLoadingStats(false);
    }
  }

  const handleAccountUpload = async () => {
    if (!accounts.trim()) {
      toast({
        title: 'Error',
        description: 'Accounts list cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    const lines = accounts.trim().split('\n');
    let successCount = 0;
    let errorCount = 0;
    
    const accountPromises = lines.map(async (line) => {
      const [email, password] = line.split(':');
      if (email && password) {
        try {
          await addDoc(collection(db, 'accounts'), {
            email: email.trim(),
            password: password.trim(),
            status: 'unclaimed',
            timestamp: serverTimestamp(),
          });
          successCount++;
        } catch (e) {
          errorCount++;
          console.error('Error adding account: ', e);
        }
      }
    });

    await Promise.all(accountPromises);
    
    setLoading(false);
    toast({
      title: 'Upload Complete',
      description: `${successCount} accounts added. ${errorCount} failed.`,
    });
    setAccounts('');
    fetchStats(); // Refresh stats after upload
  };
  
   const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysis('');
    try {
      const accountsRef = collection(db, 'accounts');
      const snapshot = await getDocs(accountsRef);
      const accountData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              email: data.email,
              password: data.password,
              status: data.status,
          }
      });
      
      const result = await analyzeAccountDistribution({ accountData });
      setAnalysis(result.analysisResults);

    } catch (error) {
      console.error('Error analyzing accounts:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze account distribution.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };


  if (authLoading || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-headline font-bold mb-8">Admin Dashboard</h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle>Lifetime Claims</CardTitle>
            <CardDescription>Total accounts claimed.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStats ? <Spinner /> : <p className="text-4xl font-bold">{stats.lifetime}</p>}
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle>Today's Claims</CardTitle>
            <CardDescription>Accounts claimed today.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStats ? <Spinner /> : <p className="text-4xl font-bold">{stats.today}</p>}
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 glassmorphism">
          <CardHeader>
            <CardTitle>Upload Accounts</CardTitle>
            <CardDescription>Add new accounts in `email:password` format, one per line.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={accounts}
              onChange={(e) => setAccounts(e.target.value)}
              placeholder="example1@email.com:pass123&#10;example2@email.com:pass456"
              rows={10}
              className="mb-4"
            />
            <Button onClick={handleAccountUpload} disabled={loading}>
              {loading ? <Spinner /> : 'Upload'}
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-3 glassmorphism">
          <CardHeader>
            <CardTitle>Account Analysis</CardTitle>
            <CardDescription>Use AI to analyze the account distribution for potential issues.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? <Spinner /> : 'Analyze Accounts'}
            </Button>
            {analysis && (
              <div className="mt-4 p-4 border rounded-md bg-muted/50">
                <h3 className="font-bold mb-2">Analysis Results:</h3>
                <p className="text-sm whitespace-pre-wrap">{analysis}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
