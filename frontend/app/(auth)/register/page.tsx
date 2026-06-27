'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '../../../hooks/useToast';
import api, { getErrorMessage } from '../../../lib/api';
import { ApiResponse } from '../../../types';

const registerSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password cannot exceed 72 characters'),
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setErrorMsg(null);
    try {
      await api.post<ApiResponse<{ message: string }>>('/auth/register', values);
      toast('Registration successful. You can now log in.', 'success');
      router.replace('/login');
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      setErrorMsg(message);
      toast(message, 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral px-4 py-12">
      <div
        className="w-full max-w-md bg-surface border border-secondary/20 p-8 shadow-2xl flex flex-col"
        style={{ borderRadius: '3px' }}
      >
        <div className="mb-8 text-center">
          <h2 className="font-serif text-3xl tracking-wide text-primary">
            INVENIO
          </h2>
          <p className="text-xs text-secondary tracking-widest uppercase font-semibold mt-2">
            REGISTRATION PORTAL
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMsg && (
            <div
              className="bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400 font-sans"
              style={{ borderRadius: '2px' }}
            >
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-semibold tracking-widest uppercase text-secondary">
                FIRST NAME
              </label>
              <input
                type="text"
                placeholder="John"
                {...register('firstName')}
                disabled={isSubmitting}
                className="w-full bg-neutral border border-secondary/30 text-primary px-4 py-2.5 text-sm focus:border-tertiary focus:outline-none transition-colors disabled:opacity-50 font-sans"
                style={{ borderRadius: '2px' }}
              />
              {errors.firstName && (
                <p className="text-[11px] text-red-400 font-sans">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-semibold tracking-widest uppercase text-secondary">
                LAST NAME
              </label>
              <input
                type="text"
                placeholder="Doe"
                {...register('lastName')}
                disabled={isSubmitting}
                className="w-full bg-neutral border border-secondary/30 text-primary px-4 py-2.5 text-sm focus:border-tertiary focus:outline-none transition-colors disabled:opacity-50 font-sans"
                style={{ borderRadius: '2px' }}
              />
              {errors.lastName && (
                <p className="text-[11px] text-red-400 font-sans">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-semibold tracking-widest uppercase text-secondary">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              placeholder="name@domain.com"
              {...register('email')}
              disabled={isSubmitting}
              className="w-full bg-neutral border border-secondary/30 text-primary px-4 py-2.5 text-sm focus:border-tertiary focus:outline-none transition-colors disabled:opacity-50 font-sans"
              style={{ borderRadius: '2px' }}
            />
            {errors.email && (
              <p className="text-[11px] text-red-400 font-sans">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-semibold tracking-widest uppercase text-secondary">
              PASSWORD (8-72 CHARS)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              disabled={isSubmitting}
              className="w-full bg-neutral border border-secondary/30 text-primary px-4 py-2.5 text-sm focus:border-tertiary focus:outline-none transition-colors disabled:opacity-50 font-sans"
              style={{ borderRadius: '2px' }}
            />
            {errors.password && (
              <p className="text-[11px] text-red-400 font-sans">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-tertiary text-on-primary font-semibold text-xs tracking-widest uppercase py-3 transition-colors hover:bg-tertiary/90 disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer"
            style={{ borderRadius: '2px' }}
          >
            {isSubmitting ? 'CREATING ACCOUNT...' : 'REGISTER'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-secondary">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-tertiary hover:underline transition-all font-semibold"
            >
              SIGN IN
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
