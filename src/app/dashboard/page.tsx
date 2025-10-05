'use client';

import AuthGuard from '@/components/AuthGuard';
import AdminDashboard from '@/components/AdminDashboard';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  
  return (
    <AuthGuard>
       <div className="container py-10">
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <p className="mt-4">Welcome back, {user?.email}!</p>
       </div>
    </AuthGuard>
  );
}
