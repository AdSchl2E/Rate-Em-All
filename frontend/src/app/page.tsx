import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchTopRated, fetchTrending } from '../lib/api-server/pokemon';
import { HomepageClient } from '../components/client/pages/HomepageClient';
import { LoadingSpinner } from '../components/client/ui/LoadingSpinner';
import { ChevronRightIcon, FireIcon, StarIcon } from '@heroicons/react/24/solid';
import { MapIcon, HeartIcon } from '@heroicons/react/24/outline';

export default async function HomePage() {
  const topRated = await fetchTopRated(5);
  const trending = await fetchTrending(5);

  return (
    <div className="space-y-12">
      {/* Hero section */}
      <section className="relative py-12 px-4 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="absolute inset-0 z-0 opacity-10">
          <Image
            src="/patterns/grid.svg"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Rate and discover
            </span>
            <br />
            all Pokémon
          </h1>
          
          <p className="text-lg text-gray-300 mb-8">
            Join thousands of trainers, share your experience and find the best Pokémon according to the community.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/explorer" className="btn btn-primary px-6 py-3 flex items-center">
              <MapIcon className="h-5 w-5 mr-2" /> 
              Explore all Pokémon
              <ChevronRightIcon className="h-5 w-5 ml-1" />
            </Link>
            
            <Link href="/top-rated" className="btn btn-secondary px-6 py-3 flex items-center">
              <StarIcon className="h-5 w-5 mr-2" /> 
              See rankings
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Pokémon (différent de la vue carte explorer) */}
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <FireIcon className="h-6 w-6 mr-2 text-amber-500" />
          Top Rated Pokémon
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topRated.slice(0, 3).map((pokemon, index) => (
            <Link href={`/pokemon/${pokemon.id}`} key={pokemon.id} className="group">
              <div className="bg-gray-800 rounded-xl p-4 transition-all hover:bg-gray-700 hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-700 p-1 relative">
                    <Image 
                      src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || '/placeholder.png'}
                      alt={pokemon.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium group-hover:text-blue-400 transition-colors">
                      {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                    </h3>
                    <div className="flex items-center mt-1 text-amber-400">
                      <StarIcon className="h-4 w-4 mr-1" />
                      <span>{(pokemon.rating || 0).toFixed(1)}</span>
                      <span className="text-gray-400 text-sm ml-2">({pokemon.numberOfVotes || 0} votes)</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-6">
          <Link href="/top-rated" className="inline-flex items-center text-blue-400 hover:text-blue-300">
            View all top rated Pokémon
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </section>

      {/* Pour les interactions client */}
      <Suspense fallback={<LoadingSpinner />}>
        <HomepageClient topRated={topRated} trending={trending} />
      </Suspense>
      
      {/* Call to action */}
      <section className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to join Rate-Em-All?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Create a free account to start rating your favorite Pokémon,
          track your favorites and be part of the trainer community.
        </p>
        <Link href="/signup" className="btn px-8 py-3 bg-white text-gray-900 hover:bg-gray-100">
          Sign up for free
        </Link>
      </section>
    </div>
  );
}