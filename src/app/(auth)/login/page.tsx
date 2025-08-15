'use client';

import { GoogleLoginButton } from '@/app/components/auth/GoogleLoginButton';
import { useAuth } from '@/app/context/AuthContext';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      redirect('/dashboard');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
              <Leaf className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome to Plantation Tracker
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Sign in to start tracking your plants
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className='flex justify-center'>
                <GoogleLoginButton />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Don't have an account? No problem!
                </p>
                <p className="text-xs text-muted-foreground">
                  Sign in with Google to automatically create your account
                </p>
              </div>
            </div>

            {/* Features Preview */}
            <div className="pt-6 border-t">
              <h3 className="font-semibold text-sm mb-3 text-gray-900">
                What you'll get:
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Track plants with photos and locations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>View plants on interactive map</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Join the community leaderboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Search and discover plants</span>
                </div>
              </div>
            </div>

            {/* Explore Link */}
            <div className="pt-4 text-center">
              <Link
                href="/map"
                className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <span>Explore the map first</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <a href="#" className="underline hover:text-emerald-600">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-emerald-600">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}