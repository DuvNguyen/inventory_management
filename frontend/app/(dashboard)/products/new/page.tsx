'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import { useToast } from '../../../../hooks/useToast';
import api, { getErrorMessage } from '../../../../lib/api';
import ProductForm, { ProductFormValues } from '../../../../components/products/ProductForm';

export default function NewProductPage() {
  const { isAdmin, isHydrated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isHydrated && !isAdmin) {
      router.replace('/products');
    }
  }, [isHydrated, isAdmin, router]);

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      await api.post('/products', values);
      toast('Product successfully created.', 'success');
      router.replace('/products');
    } catch (error: unknown) {
      toast(getErrorMessage(error), 'error');
    }
  };

  if (!isHydrated || !isAdmin) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border border-tertiary border-t-transparent animate-spin rounded-sm"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
}
