import AuthGuard from '@/components/AuthGuard';
import AdminDashboard from '@/components/AdminDashboard';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <AdminDashboard />
    </AuthGuard>
  );
}
