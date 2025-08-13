'use client';

import { Button } from '@/components/ui/button';
import { googleProvider, auth } from '@/app/config/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';

export function GoogleLoginButton() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to login');
      console.error(error);
    }
  };

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={handleLogin}
    >
      <FcGoogle className="w-5 h-5" />
      Continue with Google
    </Button>
  );
}