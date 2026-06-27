'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../../hooks/useAuth';
import { useToast } from '../../../../../hooks/useToast';
import api, { getErrorMessage } from '../../../../../lib/api';
import { Product, ApiResponse } from '../../../../../types';
import ProductForm, { ProductFormValues } from '../../../../../components/products/ProductForm';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  const { isAdmin, isHydrated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isHydrated && !isAdmin) {
      router.replace('/products');
    }
  }, [isHydrated, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
        setProduct(response.data.data);
      } catch (error: unknown) {
        toast(getErrorMessage(error), 'error');
        router.replace('/products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, isAdmin, router, toast]);

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      await api.patch(`/products/${id}`, values);
      toast('Product successfully updated.', 'success');
      router.replace('/products');
    } catch (error: unknown) {
      toast(getErrorMessage(error), 'error');
    }
  };

  if (!isHydrated || !isAdmin || isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border border-tertiary border-t-transparent animate-spin rounded-sm"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center p-12">
        <p className="text-sm text-secondary font-medium uppercase tracking-wider">PRODUCT NOT FOUND</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProductForm initialData={product} onSubmit={handleSubmit} isEdit={true} />
    </div>
  );
}
