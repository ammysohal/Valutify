
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ClaimLogic from '@/components/ClaimLogic';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function ClaimPageContents() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    if (!token) {
        return (
            <Alert>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Invalid claim request. No token provided.</AlertDescription>
            </Alert>
        )
    }

    return <ClaimLogic claimToken={token} />;
}


export default function ClaimPage() {
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
        <Suspense fallback={
             <div className="flex flex-col items-center gap-4 text-center">
                <Spinner className="h-8 w-8" />
                <Alert>
                <AlertTitle>Loading...</AlertTitle>
                <AlertDescription>
                    Please wait while we prepare the claim page.
                </AlertDescription>
                </Alert>
          </div>
        }>
            <ClaimPageContents />
        </Suspense>
    </div>
  );
}
