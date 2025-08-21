'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/app/config/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';

import { IoHome } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { FaMapLocationDot } from "react-icons/fa6";
import { MdLeaderboard } from "react-icons/md";

// Define proper type for user metadata
interface UserMetadata {
  name?: string;
  avatar_url?: string;
  [key: string]: unknown; // Allow for other properties
}

export default function Navigation() {
  const { user } = useAuth();
  const router = useRouter();

  // Safely get user metadata with proper typing
  const userMetadata = user?.user_metadata as UserMetadata | undefined;
  const userName = userMetadata?.name || user?.email || 'Guest';

  const handleSignOut = async () => {
    toast((t) => (
      <div className="space-y-3">
        <p className="text-sm">Are you sure you want to log out?</p>
        <div className="flex gap-2 justify-center">
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await supabase.auth.signOut();
                toast.success('Logged out');
                router.push('/');
              } catch (error) {
                console.error('Error signing out:', error);
                toast.error('Failed to log out');
              }
            }}
          >
            Log out
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </Button>
        </div>
      </div>
    ), { duration: 60000 });
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-sm">
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="text-left"
        >
          <h1 className="text-xl font-bold text-green-600">🌱 Plantation Tracker</h1>
        </button>
      </div>
      
      <div className="hidden md:flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">Dashboard</Button>
        </Link>
        <Link href="/map">
          <Button variant="ghost" size="sm">Map</Button>
        </Link>
        <Link href="/leaderboard">
          <Button variant="ghost" size="sm">Leaderboard</Button>
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        {!user && (
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userMetadata?.avatar_url} alt={userName} />
              <AvatarFallback>
                {user ? (userMetadata?.name?.charAt(0) || user.email?.charAt(0)) : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {userName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user ? user.email : 'Not signed in'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/')}><IoHome />Home</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard')}><MdDashboard />Dashboard</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/map')}><FaMapLocationDot />Map</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/leaderboard')}><MdLeaderboard />Leaderboard</DropdownMenuItem>
          <DropdownMenuSeparator />
          {user ? (
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => router.push('/login')}>Sign In</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </nav>
  );
}