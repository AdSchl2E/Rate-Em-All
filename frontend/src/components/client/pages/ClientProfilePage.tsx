'use client';

import { useSession } from "next-auth/react";
import Image from 'next/image';
import Link from 'next/link';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { HeartIcon, StarIcon } from '@heroicons/react/24/solid';
import { UserIcon } from '@heroicons/react/24/outline';
import { ClientStarRating } from '../ui/ClientStarRating';
import { useFavorites } from '../../../providers/FavoritesProvider';
import { useRatings } from '../../../providers/RatingsProvider';

export function ClientProfilePage() {
  const { data: session } = useSession();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const { userRatings, loading: ratingsLoading } = useRatings();
  
  // Count rated Pokémon
  const ratedPokemonCount = userRatings ? Object.keys(userRatings).length : 0;

  // Get user info
  const userId = session?.user?.id;
  const userName = session?.user?.name || "User";
  const userImage = session?.user?.image;
  
  // Loading states
  if (!session) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Profile page</h1>
        <p>Please login to see your profile</p>
        <Link href="/login" className="btn btn-primary mt-4 inline-block">
          Login
        </Link>
      </div>
    );
  }

  if (favoritesLoading || ratingsLoading) {
    return <LoadingSpinner />;
  }

  // Calculate average rating
  const calculateAverageRating = (ratings: Record<number, number>) => {
    const values = Object.values(ratings);
    if (values.length === 0) return 0;
    return values.reduce((sum, rating) => sum + rating, 0) / values.length;
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Profile header */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-violet-500">
            {userImage ? (
              <Image 
                src={userImage} 
                width={96} 
                height={96} 
                alt={`${userName}'s avatar`}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-white" />
              </div>
            )}
          </div>
          
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold">{userName}</h1>
            <p className="text-gray-400 mt-1">{session?.user?.email}</p>
            
            {/* User stats */}
            <div className="flex gap-6 mt-4 text-center">
              <div>
                <div className="text-2xl font-bold">{favorites?.length || 0}</div>
                <div className="text-sm text-gray-400">Favorites</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{ratedPokemonCount}</div>
                <div className="text-sm text-gray-400">Rated</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {userRatings ? calculateAverageRating(userRatings).toFixed(1) : '0.0'}
                </div>
                <div className="text-sm text-gray-400">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites section with ratings */}
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <HeartIcon className="h-6 w-6 mr-2 text-red-500" />
        Your Favorites
      </h2>
      
      {favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {favorites.map((pokemon, index) => (
            <div key={pokemon.id || `pokemon-${index}`} className="bg-gray-800 rounded-xl overflow-hidden">
              <Link href={`/pokemon/${pokemon.id}`} className="block p-4 hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Correction pour éviter l'erreur avec sprites.other */}
                  <div className="w-16 h-16 relative">
                    <Image
                      src={pokemon.sprites?.other?.['official-artwork']?.front_default || 
                          pokemon.sprites?.front_default || 
                          '/placeholder.png'}
                      alt={pokemon.name || "Pokémon"}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">
                      {pokemon.name ? pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1) : "Unknown Pokémon"}
                    </h3>
                    
                    {/* Show rating under favorites */}
                    <div className="flex items-center mt-1">
                      {userRatings && userRatings[pokemon.id] ? (
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 text-amber-400 mr-1" />
                          <span className="text-sm">
                            {userRatings[pokemon.id]}/5
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not rated yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl p-8 text-center mb-12">
          <p className="text-gray-400 mb-4">You haven't added any Pokémon to your favorites yet.</p>
          <Link href="/explorer" className="btn btn-primary">
            Explore Pokémon
          </Link>
        </div>
      )}

      {/* User ratings section */}
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <StarIcon className="h-6 w-6 mr-2 text-amber-500" />
        Your Ratings
      </h2>
      
      {userRatings && Object.keys(userRatings).length > 0 ? (
        <div className="bg-gray-800 rounded-xl p-6">
          <p className="text-center text-lg mb-2">
            You've rated <span className="font-bold text-blue-400">{Object.keys(userRatings).length}</span> Pokémon
          </p>
          <p className="text-center text-gray-400">
            Your average rating is <span className="font-bold text-amber-400">
              {calculateAverageRating(userRatings).toFixed(1)}
            </span>/5
          </p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400 mb-4">You haven't rated any Pokémon yet.</p>
          <Link href="/explorer" className="btn btn-primary">
            Rate Some Pokémon
          </Link>
        </div>
      )}
    </div>
  );
}