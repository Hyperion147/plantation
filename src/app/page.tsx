import PlantCarousel from '@/app/components/carousel/Carousel';
import PlantSearch from '@/app/components/search/PlantSearch';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen">
      <div className="relative">
        <PlantCarousel />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 text-white">
          <h1 className="text-5xl font-bold mb-4">Plantation Tracker</h1>
          <p className="text-xl mb-8">Track, Grow, and Celebrate Your Green Journey</p>
          <Link href={user ? '/dashboard' : '/login'}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 px-8 py-6 text-lg">
              Track My Plant
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">Find Plants</h2>
          <PlantSearch />
        </div>
      </div>
    </main>
  );
}