'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, where, Timestamp, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import type { Account } from '@/lib/actions';

const ADMIN_EMAIL = 'amninderoshal10@gmail.com';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState({ lifetime: 0, today: 0 });
  const [accountInput, setAccountInput] = useState('');
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const fetchStatsAndAccounts = useCallback(async () => {
    setLoadingStats(true);
    setLoadingAccounts(true);
    try {
      const accountsRef = collection(db, 'accounts');
      
      // Fetch stats
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
      
      // Fetch all accounts
      const allAccountsSnapshot = await getDocs(query(accountsRef, orderBy('timestamp', 'desc')));
      const accountsList = allAccountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
      setAllAccounts(accountsList);

    } catch (error) {
      console.error('Error fetching data: ', error);
      toast({
        title: 'Error',
        description: 'Could not fetch dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setLoadingStats(false);
      setLoadingAccounts(false);
    }
  }, [toast]);


  useEffect(() => {
    if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  useEffect(() => {
    if (user) {
      fetchStatsAndAccounts();
    }
  }, [user, fetchStatsAndAccounts]);


  const handleAccountUpload = async () => {
    if (!accountInput.trim()) {
      toast({
        title: 'Error',
        description: 'Accounts list cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    const lines = accountInput.trim().split('\n');
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
    setAccountInput('');
    fetchStatsAndAccounts(); // Refresh stats and accounts list after upload
  };
  
  const handleDeleteAccount = async (accountId: string) => {
    if (!window.confirm('Are you sure you want to delete this account?')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'accounts', accountId));
      toast({
        title: 'Success',
        description: 'Account deleted successfully.',
      });
      fetchStatsAndAccounts(); // Refresh list
    } catch (error) {
      console.error('Error deleting account: ', error);
      toast({
        title: 'Error',
        description: 'Could not delete account.',
        variant: 'destructive',
      });
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

      <div className="grid gap-8 md:grid-cols-2">
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
        
        <Card className="md:col-span-2 glassmorphism">
          <CardHeader>
            <CardTitle>Upload Accounts</CardTitle>
            <CardDescription>Add new accounts in `email:password` format, one per line.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={accountInput}
              onChange={(e) => setAccountInput(e.target.value)}
              placeholder="example1@email.com:pass123\nexample2@email.com:pass456"
              rows={10}
              className="mb-4"
            />
            <Button onClick={handleAccountUpload} disabled={loading}>
              {loading ? <Spinner /> : 'Upload'}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 glassmorphism">
            <CardHeader>
                <CardTitle>Manage Accounts</CardTitle>
                <CardDescription>View and delete uploaded accounts.</CardDescription>
            </CardHeader>
            <CardContent>
                {loadingAccounts ? (
                    <div className="flex justify-center p-8">
                        <Spinner />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Added</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allAccounts.map((account) => (
                                <TableRow key={account.id}>
                                    <TableCell>{account.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={account.status === 'claimed' ? 'secondary' : 'default'}>
                                            {account.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {account.timestamp?.toDate().toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteAccount(account.id)}
                                            >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                 {allAccounts.length === 0 && !loadingAccounts && (
                    <p className="text-center text-muted-foreground py-8">No accounts found.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
