'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { accessToken, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !accessToken) {
      router.replace('/login');
    }
  }, [isHydrated, accessToken, router]);

  if (!isHydrated || !accessToken) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="w-8 h-8 border border-tertiary border-t-transparent animate-spin rounded-sm"></div>
      </div>
    );
  }

  return <>{children}</>;
}
