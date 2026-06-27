import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';

export function useAuth() {
  const store = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const user = isHydrated ? store.user : null;
  const accessToken = isHydrated ? store.accessToken : null;

  return {
    user,
    accessToken,
    isAdmin: user?.role === 'ADMIN',
    clearAuth: store.clearAuth,
    setAuth: store.setAuth,
    isHydrated,
  };
}
