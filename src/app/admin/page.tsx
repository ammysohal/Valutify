'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth as useFirebaseUser } from '@/firebase'; // Renamed to avoid conflict with old useAuth
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  where,
  Timestamp,
  orderBy,
  doc,
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import type { Account } from '@/lib/actions';

const ADMIN_EMAIL = 'amnindersohal10@gmail.com';

export default function AdminDashboard() {
  const { user, isUserLoading: authLoading } = useFirebaseUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [accountInput, setAccountInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Memoize the collection reference
  const accountsColRef = useMemoFirebase(() => collection(firestore, 'minecraft_accounts'), [firestore]);

  // Use the useCollection hook to fetch accounts
  const { data: allAccounts, isLoading: loadingAccounts, error: accountsError } = useCollection<Account>(accountsColRef);

  // Derived state for stats from the fetched accounts
  const stats = useMemo(() => {
    if (!allAccounts) {
      return { lifetime: 0, today: 0 };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lifetime = allAccounts.filter(acc => acc.status === 'claimed').length;
    const todayClaims = allAccounts.filter(acc => {
        return acc.status === 'claimed' && acc.timestamp && acc.timestamp.toDate() >= today
    }).length;

    return { lifetime, today: todayClaims };
  }, [allAccounts]);

  useEffect(() => {
    if (accountsError) {
      toast({
        title: 'Error',
        description: 'Could not fetch accounts. You may not have permission.',
        variant: 'destructive',
      });
    }
  }, [accountsError, toast]);

  useEffect(() => {
    if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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
    
    const accountPromises = lines.map(async (line) => {
      const [email, password] = line.split(':');
      if (email && password) {
        addDocumentNonBlocking(accountsColRef, {
            email: email.trim(),
            password: password.trim(),
            status: 'unclaimed',
            timestamp: Timestamp.now(),
        });
        successCount++;
      }
    });

    await Promise.all(accountPromises);
    
    setLoading(false);
    toast({
      title: 'Upload Queued',
      description: `${successCount} accounts are being added.`,
    });
    setAccountInput('');
    // Data will refresh automatically via useCollection
  };
  
  const handleDeleteAccount = async (accountId: string) => {
    if (!window.confirm('Are you sure you want to delete this account?')) {
      return;
    }
    const docRef = doc(firestore, 'minecraft_accounts', accountId);
    deleteDocumentNonBlocking(docRef);
    toast({
        title: 'Deletion Queued',
        description: 'The account is being deleted.',
      });
    // Data will refresh automatically via useCollection
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
            {loadingAccounts ? <Spinner /> : <p className="text-4xl font-bold">{stats.lifetime}</p>}
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle>Today's Claims</CardTitle>
            <CardDescription>Accounts claimed today.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAccounts ? <Spinner /> : <p className="text-4xl font-bold">{stats.today}</p>}
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
                            {allAccounts && allAccounts.map((account) => (
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
                 {(!allAccounts || allAccounts.length === 0) && !loadingAccounts && (
                    <p className="text-center text-muted-foreground py-8">No accounts found.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
