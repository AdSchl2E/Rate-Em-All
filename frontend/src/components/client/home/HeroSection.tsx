'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <Image 
          src="/patterns/grid.svg" 
          alt="Grid pattern"
          fill
          className="object-cover"
        />
      </div>
      
      <div className="relative z-10 px-6 py-12 md:px-12 md:py-16 text-white">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Découvrez et notez <span className="text-yellow-300">tous les Pokémon</span>
            </h1>
            <p className="text-lg md:text-xl mb-6 text-blue-100">
              Explorez la base de données complète des Pokémon, partagez vos évaluations et découvrez les favoris de la communauté.
            </p>
            
            <form onSubmit={handleSearch} className="flex w-full max-w-md">
              <div className="relative flex-grow">
                <input 
                  type="text"
                  placeholder="Rechercher un Pokémon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-l-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-0 h-full px-3 text-blue-100"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </div>
              <button 
                type="submit"
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-medium rounded-r-lg transition-colors"
              >
                Rechercher
              </button>
            </form>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-80 h-80 md:w-100 md:h-100">
              <Image 
                src="/images/pokemon-group.png" 
                alt="Pokémon group"
                fill
                className="object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}