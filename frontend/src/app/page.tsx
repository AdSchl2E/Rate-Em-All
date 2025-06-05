import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchTopRated, fetchAllPokemon } from '../lib/api-server/pokemon';
import { HomepageClient } from '../components/client/pages/HomepageClient';
import { LoadingSpinner } from '../components/client/ui/LoadingSpinner';
import { ChevronRightIcon, FireIcon, StarIcon } from '@heroicons/react/24/solid';
import { MapIcon, HeartIcon } from '@heroicons/react/24/outline';
import { AuthCTA } from '../components/client/auth/AuthCTA';

export default async function HomePage() {
  // Récupérer tous les Pokémon pour le carrousel
  const allPokemons = await fetchAllPokemon(100); // Limiter à 100 pour performance
  const topRated = await fetchTopRated(5);

  return (
    <div className="space-y-12">
      {/* Hero section - gardée identique */}
      <section className="relative py-12 px-4 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="absolute inset-0 z-0 opacity-10">
          <Image
            src="/patterns/grid.svg"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
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

      {/* Carrousel de Pokémon avec notes mises à jour */}
      <Suspense fallback={<LoadingSpinner />}>
        <HomepageClient pokemons={allPokemons}/>
      </Suspense>
      
      {/* CTA conditionnel - ne s'affiche que pour les utilisateurs non connectés */}
      <AuthCTA />
    </div>
  );
}