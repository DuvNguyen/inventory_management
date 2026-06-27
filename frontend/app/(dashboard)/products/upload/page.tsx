'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import CsvUploader from '../../../../components/products/CsvUploader';

export default function UploadCsvPage() {
  const { isAdmin, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAdmin) {
      router.replace('/products');
    }
  }, [isHydrated, isAdmin, router]);

  if (!isHydrated || !isAdmin) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border border-tertiary border-t-transparent animate-spin rounded-sm"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CsvUploader />
    </div>
  );
}
