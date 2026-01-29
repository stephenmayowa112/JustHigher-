'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't protect login, unauthorized, and setup pages
  const isPublicPage = pathname === '/admin/login' || pathname === '/admin/unauthorized' || pathname === '/admin/setup';

  return (
    <AuthProvider>
      {isPublicPage ? (
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      ) : (
        <ProtectedRoute requireAdmin={true}>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
}