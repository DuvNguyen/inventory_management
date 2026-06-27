'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Product } from '../../types';
import { Sparkles } from 'lucide-react';

const productFormSchema = z.object({
  sku: z
    .string()
    .min(1, 'SKU is required')
    .max(50, 'SKU cannot exceed 50 characters')
    .regex(/^[A-Z0-9-]+$/, 'SKU must contain only uppercase alphanumeric characters and hyphens'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name cannot exceed 200 characters'),
  price: z
    .number({ message: 'Price is required' })
    .positive('Price must be greater than zero')
    .refine((val) => {
      const parts = val.toString().split('.');
      return parts.length < 2 || parts[1].length <= 2;
    }, 'Price can have at most 2 decimal places'),
  stock: z
    .number({ message: 'Stock is required' })
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  isEdit?: boolean;
}

export default function ProductForm({
  initialData,
  onSubmit,
  isEdit = false,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData
      ? {
          sku: initialData.sku,
          name: initialData.name,
          price: initialData.price,
          stock: initialData.stock,
        }
      : {
          sku: '',
          name: '',
          price: 0,
          stock: 0,
        },
  });

  const handleGenerateSku = () => {
    const nameVal = getValues('name') || '';
    let prefix = 'PROD';

    if (nameVal.trim()) {
      const cleanName = nameVal
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim();

      const words = cleanName.split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        prefix = words
          .slice(0, 3)
          .map((word) => word.substring(0, 3).toUpperCase())
          .join('-');
      }
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const sku = `${prefix}-${randomSuffix}`;

    setValue('sku', sku, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h3 className="font-serif text-xl tracking-wide text-primary border-b border-secondary/15 pb-4">
        {isEdit ? 'EDIT PRODUCT DETAILS' : 'CREATE NEW PRODUCT RECORD'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SKU */}
        <div className="space-y-2">
          <label className="block text-[10px] font-semibold tracking-widest uppercase text-secondary">
            STOCK KEEPING UNIT (SKU)
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="e.g. PROD-100-A"
              {...register('sku', {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  const upperValue = e.target.value.toUpperCase();
                  e.target.value = upperValue;
                  setValue('sku', upperValue, { shouldValidate: true });
                },
              })}
              disabled={isSubmitting || isEdit}
              className="w-full bg-neutral border border-secondary/30 text-primary pl-4 pr-28 py-3 text-sm focus:border-tertiary focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans uppercase font-mono"
              style={{ borderRadius: '2px' }}
            />
            {!isEdit && (
              <button
                type="button"
                onClick={handleGenerateSku}
                disabled={isSubmitting}
                className="absolute right-2 px-3 py-1.5 bg-neutral/80 border border-secondary/35 text-secondary hover:text-tertiary hover:border-tertiary transition-colors text-[9px] font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                style={{ borderRadius: '2px' }}
                title="Auto-generate SKU based on product name"
              >
                <Sparkles className="w-3 h-3 text-tertiary" />
                <span>GENERATE</span>
              </button>
            )}
          </div>
          {errors.sku && (
            <p className="text-[11px] text-red-400 font-sans">{errors.sku.message}</p>
          )}
          {isEdit && (
            <p className="text-[10px] text-secondary font-sans italic">
              SKU identifier cannot be modified.
            </p>
          )}
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="block text-[10px] font-semibold tracking-widest uppercase text-secondary">
            PRODUCT NAME
          </label>
          <input
            type="text"
            placeholder="e.g. Fine Silk Tie"
            {...register('name')}
            disabled={isSubmitting}
            className="w-full bg-neutral border border-secondary/30 text-primary px-4 py-3 text-sm focus:border-tertiary focus:outline-none transition-colors disabled:opacity-50 font-sans"
            style={{ borderRadius: '2px' }}
          />
          {errors.name && (
            <p className="text-[11px] text-red-400 font-sans">{errors.name.message}</p>
          )}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <label className="block text-[10px] font-semibold tracking-widest uppercase text-secondary">
            UNIT PRICE (USD)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('price', { valueAsNumber: true })}
            disabled={isSubmitting}
            className="w-full bg-neutral border border-secondary/30 text-primary px-4 py-3 text-sm focus:border-tertiary focus:outline-none transition-colors disabled:opacity-50 font-mono"
            style={{ borderRadius: '2px' }}
          />
          {errors.price && (
            <p className="text-[11px] text-red-400 font-sans">{errors.price.message}</p>
          )}
        </div>

        {/* Stock */}
        <div className="space-y-2">
          <label className="block text-[10px] font-semibold tracking-widest uppercase text-secondary">
            STOCK QUANTITY
          </label>
          <input
            type="number"
            placeholder="0"
            {...register('stock', { valueAsNumber: true })}
            disabled={isSubmitting}
            className="w-full bg-neutral border border-secondary/30 text-primary px-4 py-3 text-sm focus:border-tertiary focus:outline-none transition-colors disabled:opacity-50 font-mono"
            style={{ borderRadius: '2px' }}
          />
          {errors.stock && (
            <p className="text-[11px] text-red-400 font-sans">{errors.stock.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-secondary/15">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-tertiary text-on-primary font-semibold text-xs tracking-widest uppercase px-6 py-3 transition-colors hover:bg-tertiary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{ borderRadius: '2px' }}
        >
          {isSubmitting ? 'SAVING...' : 'SAVE RECORD'}
        </button>
      </div>
    </form>
  );
}
