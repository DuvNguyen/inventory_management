'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../../store/auth.store';
import { useToast } from '../../../hooks/useToast';
import api, { getErrorMessage } from '../../../lib/api';
import { ApiResponse, User } from '../../../types';

const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .transform((val) => val.trim().toLowerCase()),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMsg(null);
    try {
      const response = await api.post<ApiResponse<{ accessToken: string; user: User }>>(
        '/auth/login',
        values
      );

      const { accessToken, user } = response.data.data;
      setAuth(accessToken, user);
      toast('Welcome back to the portal.', 'success');
      router.replace('/products');
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
            INVENTORY ACCESS
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errorMsg && (
            <div
              className="bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400 font-sans"
              style={{ borderRadius: '2px' }}
            >
              {errorMsg}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[10px] font-semibold tracking-widest uppercase text-secondary">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              placeholder="name@domain.com"
              {...register('email')}
              disabled={isSubmitting}
              className="w-full bg-neutral border border-secondary/30 text-primary px-4 py-3 text-sm focus:border-tertiary focus:outline-none transition-colors disabled:opacity-50 font-sans"
              style={{ borderRadius: '2px' }}
            />
            {errors.email && (
              <p className="text-[11px] text-red-400 font-sans">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-semibold tracking-widest uppercase text-secondary">
              PASSWORD
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              disabled={isSubmitting}
              className="w-full bg-neutral border border-secondary/30 text-primary px-4 py-3 text-sm focus:border-tertiary focus:outline-none transition-colors disabled:opacity-50 font-sans"
              style={{ borderRadius: '2px' }}
            />
            {errors.password && (
              <p className="text-[11px] text-red-400 font-sans">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-tertiary text-on-primary font-semibold text-xs tracking-widest uppercase py-3 transition-colors hover:bg-tertiary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ borderRadius: '2px' }}
          >
            {isSubmitting ? 'VERIFYING...' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-secondary">
            Need an account?{' '}
            <Link
              href="/register"
              className="text-tertiary hover:underline transition-all font-semibold"
            >
              REGISTER
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
