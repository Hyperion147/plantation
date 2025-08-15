"use client"

import PlantCarousel from '@/app/components/carousel/Carousel';
import PlantSearch from '@/app/components/search/PlantSearch';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Users, Leaf, TrendingUp } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: Leaf,
      title: "Track Your Plants",
      description: "Add plants with photos, descriptions, and GPS coordinates"
    },
    {
      icon: MapPin,
      title: "Interactive Map",
      description: "View all plants on an interactive map with detailed information"
    },
    {
      icon: Users,
      title: "Community",
      description: "Join a community of plant enthusiasts and share your collection"
    },
    {
      icon: TrendingUp,
      title: "Leaderboard",
      description: "Compete with other users and see who tracks the most plants"
    }
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-green-600/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-gray-900">
            Plantation Tracker
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 text-gray-700 max-w-2xl mx-auto">
            Track, Grow, and Celebrate Your Green Journey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={user ? '/dashboard' : '/login'}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
                {user ? 'Go to Dashboard' : 'Start Tracking'}
              </Button>
            </Link>
            {!user && (
              <Link href="/map">
                <Button variant="outline" className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
                  Explore Map
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              Everything You Need to Track Your Plants
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From individual plant tracking to community features, we've got everything covered
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6 sm:p-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">
              Find Plants
            </h2>
            <p className="text-gray-600">
              Search through our community's plant collection
            </p>
          </div>
          <PlantSearch />
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