'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Account, deleteAccount, updateAccountStatus } from '@/lib/actions';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react';
import { useState, useTransition } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


export default function AccountsTable({ accounts, onAction }: { accounts: Account[]; onAction: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleUpdateStatus = (id: string, currentStatus: 'claimed' | 'unclaimed') => {
    startTransition(async () => {
      const newStatus = currentStatus === 'claimed' ? 'unclaimed' : 'claimed';
      const result = await updateAccountStatus(id, newStatus);
      if (result.success) {
        toast({ title: 'Success', description: result.success });
        onAction();
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteAccount(id);
      if (result.success) {
        toast({ title: 'Success', description: result.success });
        onAction();
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Password</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id} className={isPending ? 'opacity-50' : ''}>
              <TableCell className="font-medium">{account.email}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{visiblePasswords[account.id] ? account.password : '••••••••'}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePasswordVisibility(account.id)}>
                    {visiblePasswords[account.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={account.status === 'claimed' ? 'secondary' : 'default'} className={account.status === 'claimed' ? 'bg-purple-500' : 'bg-cyan-500'}>
                  {account.status}
                </Badge>
              </TableCell>
              <TableCell>
                {account.timestamp ? formatDistanceToNow(new Date(account.timestamp.seconds * 1000), { addSuffix: true }) : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleUpdateStatus(account.id, account.status)} disabled={isPending}>
                  {account.status === 'claimed' ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isPending}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(account.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
