"use client"

import PlantCarousel from '@/app/components/carousel/Carousel';
import PlantSearch from '@/app/components/search/PlantSearch';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-green-600/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        <PlantCarousel />
      </section>

      {/* Search Section */}
      <section className="pt-8 sm:pt-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">
              Find Plants
            </h2>
          </div>
          <PlantSearch />
        </div>
      </section>

      <section className="relative flex items-center justify-center">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href={user ? '/dashboard' : '/login'}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
              {user ? 'Go to Dashboard' : 'Start Tracking'}
            </Button>
          </Link>
          <Link href="/map">
            <Button variant="outline" className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
              Explore Map
            </Button>
          </Link>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">
            Ready to Start Your Plant Journey?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of plant enthusiasts tracking their green friends
          </p>
          <Link href={user ? '/dashboard' : '/login'}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 px-8 py-4 text-lg">
              {user ? 'Add Your First Plant' : 'Get Started Today'}
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}