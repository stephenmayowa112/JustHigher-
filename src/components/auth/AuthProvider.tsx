'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, getCurrentUser, onAuthStateChange } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let initialCheckDone = false;

    // Listen for auth changes — this fires immediately with current session
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      initialCheckDone = true;
    });

    // Fallback: if onAuthStateChange hasn't fired within 500ms, fetch manually
    const timeout = setTimeout(() => {
      if (!initialCheckDone) {
        getCurrentUser().then((user) => {
          setUser(user);
          setLoading(false);
        });
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    isAdmin: user?.isAdmin || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}