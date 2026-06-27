import { useCallback } from 'react';
import { useToastStore } from '../store/toast.store';

export function useToast() {
  const addToast = useToastStore((state) => state.addToast);
  
  const toast = useCallback((message: string, type?: 'success' | 'error' | 'info') => {
    addToast(message, type);
  }, [addToast]);

  const success = useCallback((message: string) => {
    addToast(message, 'success');
  }, [addToast]);

  const error = useCallback((message: string) => {
    addToast(message, 'error');
  }, [addToast]);

  const info = useCallback((message: string) => {
    addToast(message, 'info');
  }, [addToast]);
  
  return {
    toast,
    success,
    error,
    info,
  };
}
