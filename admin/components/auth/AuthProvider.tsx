'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, signIn, signUp, getMe, setToken, removeToken } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ['/login', '/signup'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const res = await getMe();
      if (res.success && res.data) {
        setUser(res.data.user);
      } else {
        setUser(null);
        removeToken();
      }
    } catch {
      setUser(null);
      removeToken();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!loading && !user && !PUBLIC_PATHS.includes(pathname)) {
      router.push('/login');
    }
  }, [loading, user, pathname, router]);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const res = await signIn(email, password);
      if (res.success && res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
        router.push('/dashboard');
        return {};
      }
      return { error: res.error || 'Invalid credentials' };
    } catch {
      return { error: 'Network error. Please try again.' };
    }
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    try {
      const res = await signUp(name, email, password);
      if (res.success && res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
        router.push('/dashboard');
        return {};
      }
      return { error: res.error || 'Failed to create account' };
    } catch {
      return { error: 'Network error. Please try again.' };
    }
  };

  const handleSignOut = () => {
    removeToken();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
