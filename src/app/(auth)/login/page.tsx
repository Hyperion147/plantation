'use client';

import { GoogleLoginButton } from '@/app/components/auth/GoogleLoginButton';
import { useAuth } from '@/app/context/AuthContext';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      redirect('/dashboard');
    }
  }, [user, loading]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login to Track Your Plants</h1>
        <div className="flex justify-center">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
}