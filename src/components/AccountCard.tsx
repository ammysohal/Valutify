'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check } from 'lucide-react';
import { Account } from '@/lib/actions';

export default function AccountCard({ account }: { account: Account }) {
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

  return (
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
  );
}
