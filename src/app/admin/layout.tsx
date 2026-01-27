import { AuthProvider } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin={true}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}