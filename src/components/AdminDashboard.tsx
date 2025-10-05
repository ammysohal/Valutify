'use client';

import { getAccounts, uploadAccount, runAccountAnalysis, Account } from '@/lib/actions';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import AccountsTable from './AccountsTable';
import { Spinner } from './ui/spinner';
import { BrainCircuit, Upload } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function AdminDashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, startAnalysisTransition] = useTransition();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const fetchAccounts = async () => {
    setLoading(true);
    const result = await getAccounts();
    if (result.data) {
      setAccounts(result.data);
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleRefresh = () => {
    fetchAccounts();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('email', values.email);
      formData.append('password', values.password);

      const result = await uploadAccount(formData);
      if (result.success) {
        toast({ title: 'Success', description: result.success });
        form.reset();
        fetchAccounts();
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  const handleAnalyze = () => {
    startAnalysisTransition(async () => {
        setAnalysisResult(null);
        const result = await runAccountAnalysis();
        if(result.data){
            setAnalysisResult(result.data);
        } else {
            toast({ title: 'Analysis Failed', description: result.error, variant: 'destructive' });
        }
    });
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
             <Button variant="outline" onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? <Spinner /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                Analyze Distribution
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Account Distribution Analysis</AlertDialogTitle>
              <AlertDialogDescription>
                {isAnalyzing && <div className="flex items-center gap-2"><Spinner /> Analyzing...</div>}
                {analysisResult && <div className="mt-4 text-sm text-foreground whitespace-pre-wrap">{analysisResult}</div>}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs defaultValue="manage">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage">Manage Accounts</TabsTrigger>
          <TabsTrigger value="upload">Upload Account</TabsTrigger>
        </TabsList>
        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Manage Accounts</CardTitle>
              <CardDescription>View, update, or delete existing accounts.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <div className="flex justify-center p-8"><Spinner/></div> : <AccountsTable accounts={accounts} onAction={handleRefresh} />}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Account</CardTitle>
              <CardDescription>Add a new unclaimed account to the database.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="user@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isPending}>
                    {isPending ? <Spinner /> : <><Upload className="mr-2 h-4 w-4" /> Upload Account</>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
