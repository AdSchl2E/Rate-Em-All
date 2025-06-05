'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { HeartIcon, StarIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { UserIcon, ChevronDownIcon, CogIcon } from '@heroicons/react/24/outline';
import { ClientStarRating } from '../ui/ClientStarRating';
import { useGlobal } from '../../../providers/GlobalProvider';
import { fetchPokemonsByIds } from '../../../lib/api-client/pokemon';
import { Pokemon } from '../../../types/pokemon';
import { typeColors } from '../../../lib/utils/pokemonTypes';
import { CommunityRating } from '../ui/CommunityRating';
import { getRatingColor } from '../../../lib/utils/ratingColors';

export function ClientProfilePage() {
  const { data: session } = useSession();
  const { favorites, userRatings, loading: globalLoading, pokemonCache, username } = useGlobal();
  
  const [favoritePokemons, setFavoritePokemons] = useState<Pokemon[]>([]);
  const [ratedPokemons, setRatedPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // États pour le tri
  const [favoriteSortBy, setFavoriteSortBy] = useState<'userRating' | 'communityRating' | 'votes'>('userRating');
  const [favoriteSortDir, setFavoriteSortDir] = useState<'asc' | 'desc'>('asc');
  const [ratedSortBy, setRatedSortBy] = useState<'userRating' | 'communityRating' | 'votes'>('userRating');
  const [ratedSortDir, setRatedSortDir] = useState<'asc' | 'desc'>('asc');

  // État pour afficher tous les Pokémon notés
  const [showAllRated, setShowAllRated] = useState(false);

  // Ajout d'un état pour contrôler l'affichage de tous les favoris (en haut du composant)
  const [showAllFavorites, setShowAllFavorites] = useState(false);

  // Count rated Pokémon
  const ratedPokemonCount = userRatings ? Object.keys(userRatings).length : 0;

  // Get user info
  const userId = session?.user?.id;
  const userName = username || session?.user?.name || "User";
  const userImage = session?.user?.image;

  // Charger les détails des Pokémon favoris et notés
  useEffect(() => {
    async function loadUserPokemon() {
      if (globalLoading || !session?.user) return;

      setLoading(true);
      try {
        // Charger les favoris
        if (favorites.length > 0) {
          const favPokemon = await fetchPokemonsByIds(favorites);
          setFavoritePokemons(favPokemon);
        }

        // Charger les Pokémon notés
        if (Object.keys(userRatings).length > 0) {
          const ratedIds = Object.keys(userRatings).map(Number);
          const ratedPokemon = await fetchPokemonsByIds(ratedIds);
          setRatedPokemons(ratedPokemon);
        }
      } catch (error) {
        console.error('Error loading user pokemons:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserPokemon();
  }, [session, favorites, userRatings, globalLoading]);

  // Méthode de tri pour les favoris
  const sortedFavorites = useMemo(() => {
    return [...favoritePokemons].sort((a, b) => {
      const dirFactor = favoriteSortDir === 'asc' ? 1 : -1;

      switch (favoriteSortBy) {
        case 'userRating':
          return dirFactor * ((userRatings[b.id] || 0) - (userRatings[a.id] || 0));
        case 'communityRating':
          const aRating = pokemonCache[a.id]?.rating || a.rating || 0;
          const bRating = pokemonCache[b.id]?.rating || b.rating || 0;
          return dirFactor * (bRating - aRating);
        case 'votes':
          const aVotes = pokemonCache[a.id]?.numberOfVotes || a.numberOfVotes || 0;
          const bVotes = pokemonCache[b.id]?.numberOfVotes || b.numberOfVotes || 0;
          return dirFactor * (bVotes - aVotes);
        default:
          return 0;
      }
    });
  }, [favoritePokemons, favoriteSortBy, favoriteSortDir, userRatings, pokemonCache]);

  // Méthode de tri pour les notés
  const sortedRated = useMemo(() => {
    return [...ratedPokemons].sort((a, b) => {
      const dirFactor = ratedSortDir === 'asc' ? 1 : -1;

      switch (ratedSortBy) {
        case 'userRating':
          return dirFactor * ((userRatings[b.id] || 0) - (userRatings[a.id] || 0));
        case 'communityRating':
          const aRating = pokemonCache[a.id]?.rating || a.rating || 0;
          const bRating = pokemonCache[b.id]?.rating || b.rating || 0;
          return dirFactor * (bRating - aRating);
        case 'votes':
          const aVotes = pokemonCache[a.id]?.numberOfVotes || a.numberOfVotes || 0;
          const bVotes = pokemonCache[b.id]?.numberOfVotes || b.numberOfVotes || 0;
          return dirFactor * (bVotes - aVotes);
        default:
          return 0;
      }
    });
  }, [ratedPokemons, ratedSortBy, ratedSortDir, userRatings, pokemonCache]);

  // Fonction utilitaire pour changer la direction de tri
  const toggleSortDirection = (current: 'asc' | 'desc'): 'asc' | 'desc' => {
    return current === 'asc' ? 'desc' : 'asc';
  };

  // Limiter le nombre de Pokémon affichés
  const displayedRated = showAllRated ? sortedRated : sortedRated.slice(0, 30);

  // Limiter les favoris affichés
  const displayedFavorites = showAllFavorites ? sortedFavorites : sortedFavorites.slice(0, 10);

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

  if (loading || globalLoading) {
    return <LoadingSpinner />;
  }

  // Calculate average rating
  const calculateAverageRating = (ratings: Record<number, number>) => {
    const values = Object.values(ratings);
    if (values.length === 0) return 0;
    return values.reduce((sum, rating) => sum + rating, 0) / values.length;
  };

  return (
    <div className="mx-auto animate-fade-in">
      {/* Profile header */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8">
        <div className="flex items-center">
          <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-violet-500 flex-shrink-0">
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

          <div className="flex-grow ml-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{userName}</h1>
              <p className="text-gray-400">{session?.user?.email}</p>
            </div>

            {/* User stats - maintenant alignés avec l'image et le nom */}
            <div className="flex items-center">

              <div className="flex gap-8">
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold text-red-400">{favorites?.length || 0}</div>
                  <div className="text-sm text-gray-400">Favoris</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold text-amber-400">{ratedPokemonCount}</div>
                  <div className="text-sm text-gray-400">Notés</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold flex items-center">
                    {userRatings && Object.keys(userRatings).length > 0 ? (
                      <>
                        {calculateAverageRating(userRatings).toFixed(1)}
                        <StarIcon className="h-4 w-4 text-amber-400 ml-1" />
                      </>
                    ) : '0.0'}
                  </div>
                  <div className="text-sm text-gray-400">Note moyenne</div>
                </div>
              </div>
            </div>

            {/* Ajouter le bouton paramètres ici */}
              <Link
                href="/settings"
                className="flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
              >
                <CogIcon className="h-5 w-5 mr-2" />
                <span>Paramètres</span>
              </Link>

              
          </div>
        </div>
      </div>

      {/* Favorites section with ratings and sorting */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <HeartIcon className="h-6 w-6 mr-2 text-red-500" />
            Vos Favoris
          </h2>

          {favoritePokemons.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Trier par:</span>
              <div className="flex rounded-lg overflow-hidden">
                <button
                  className={`px-3 py-1 text-sm ${favoriteSortBy === 'userRating' ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => {
                    if (favoriteSortBy === 'userRating') {
                      setFavoriteSortDir(toggleSortDirection(favoriteSortDir));
                    } else {
                      setFavoriteSortBy('userRating');
                      setFavoriteSortDir('asc'); // Initialiser avec tri ascendant
                    }
                  }}
                >
                  Ma note
                  {favoriteSortBy === 'userRating' && (
                    <span className="ml-1">
                      {favoriteSortDir === 'asc' ? '↑' : '↓'} {/* Flèche vers le haut en premier */}
                    </span>
                  )}
                </button>
                <button
                  className={`px-3 py-1 text-sm ${favoriteSortBy === 'communityRating' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => {
                    if (favoriteSortBy === 'communityRating') {
                      setFavoriteSortDir(toggleSortDirection(favoriteSortDir));
                    } else {
                      setFavoriteSortBy('communityRating');
                      setFavoriteSortDir('asc'); // Initialiser avec tri ascendant
                    }
                  }}
                >
                  Commu.
                  {favoriteSortBy === 'communityRating' && (
                    <span className="ml-1">
                      {favoriteSortDir === 'asc' ? '↑' : '↓'} {/* Flèche vers le haut en premier */}
                    </span>
                  )}
                </button>
                <button
                  className={`px-3 py-1 text-sm ${favoriteSortBy === 'votes' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => {
                    if (favoriteSortBy === 'votes') {
                      setFavoriteSortDir(toggleSortDirection(favoriteSortDir));
                    } else {
                      setFavoriteSortBy('votes');
                      setFavoriteSortDir('asc'); // Initialiser avec tri ascendant
                    }
                  }}
                >
                  Votes
                  {favoriteSortBy === 'votes' && (
                    <span className="ml-1">
                      {favoriteSortDir === 'asc' ? '↑' : '↓'} {/* Flèche vers le haut en premier */}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {favoritePokemons.length > 0 ? (
          <div className="mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {displayedFavorites.map(pokemon => (
                <div key={pokemon.id} className="bg-gray-800 hover:bg-gray-700 transition rounded-lg overflow-hidden">
                  <Link href={`/pokemon/${pokemon.id}`} className="block">
                    {/* Contenu existant des cartes de favoris */}
                    <div className="relative h-32 flex items-center justify-center">
                      {pokemon.types && pokemon.types[0] && (
                        <div className="absolute inset-0 opacity-20"
                          style={{
                            background: `radial-gradient(circle at center, ${typeColors[pokemon.types[0].type.name] || '#777'} 0%, transparent 70%)`
                          }}
                        ></div>
                      )}
                      <Image
                        src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || '/images/pokeball.png'}
                        alt={pokemon.name}
                        width={90}
                        height={90}
                        className="object-contain z-10"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/pokeball.png";
                        }}
                      />

                      <div className="absolute bottom-0 left-0 right-0 flex justify-center mb-1 gap-1">
                        {pokemon.types?.map((typeObj, idx) => {
                          const type = typeObj.type.name;
                          return (
                            <span
                              key={idx}
                              className="badge text-xs px-2 py-0.5 text-white font-medium"
                              style={{ backgroundColor: typeColors[type] || '#AAAAAA' }}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="text-center font-medium capitalize mb-2">{pokemon.name}</h3>

                      <div className="flex items-center justify-between px-2 flex-col gap-2">
                        <CommunityRating
                          rating={pokemonCache[pokemon.id]?.rating || pokemon.rating || 0}
                          votes={pokemonCache[pokemon.id]?.numberOfVotes || pokemon.numberOfVotes || 0}
                          size="sm"
                          showStars={false}
                          prominent={true}
                        />
                        <div className={`flex items-center ${getRatingColor(userRatings[pokemon.id] || 0)}`}>
                          <ClientStarRating
                            value={userRatings[pokemon.id] || 0}
                            fixed={true}
                            size="sm"
                            useColors={true}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Remplacer le lien par un bouton pour afficher tous les favoris */}
            {favoritePokemons.length > 10 && !showAllFavorites && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllFavorites(true)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white flex items-center justify-center w-full max-w-xs mx-auto transition"
                >
                  <span>Voir les {favoritePokemons.length - 10} autres favoris</span>
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}

            {/* Ajouter un bouton pour réduire la liste quand elle est déployée */}
            {showAllFavorites && favoritePokemons.length > 10 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllFavorites(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white flex items-center justify-center w-full max-w-xs mx-auto transition"
                >
                  <span>Réduire la liste</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-8 text-center mb-12">
            <p className="text-gray-400 mb-4">Vous n'avez pas encore ajouté de Pokémon à vos favoris.</p>
            <Link href="/explorer" className="btn btn-primary">
              Explorer les Pokémon
            </Link>
          </div>
        )}
      </div>

      {/* User ratings section - Modern card grid with sorting */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <StarIcon className="h-6 w-6 mr-2 text-amber-500" />
            Vos Notes ({ratedPokemonCount})
          </h2>

          {ratedPokemons.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Trier par:</span>
              <div className="flex rounded-lg overflow-hidden">
                <button
                  className={`px-3 py-1 text-sm ${ratedSortBy === 'userRating' ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => {
                    if (ratedSortBy === 'userRating') {
                      setRatedSortDir(toggleSortDirection(ratedSortDir));
                    } else {
                      setRatedSortBy('userRating');
                      setRatedSortDir('asc'); // Initialiser avec tri ascendant
                    }
                  }}
                >
                  Ma note
                  {ratedSortBy === 'userRating' && (
                    <span className="ml-1">
                      {ratedSortDir === 'asc' ? '↑' : '↓'} {/* Flèche vers le haut en premier */}
                    </span>
                  )}
                </button>
                <button
                  className={`px-3 py-1 text-sm ${ratedSortBy === 'communityRating' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => {
                    if (ratedSortBy === 'communityRating') {
                      setRatedSortDir(toggleSortDirection(ratedSortDir));
                    } else {
                      setRatedSortBy('communityRating');
                      setRatedSortDir('asc'); // Initialiser avec tri ascendant
                    }
                  }}
                >
                  Commu.
                  {ratedSortBy === 'communityRating' && (
                    <span className="ml-1">
                      {ratedSortDir === 'asc' ? '↑' : '↓'} {/* Flèche vers le haut en premier */}
                    </span>
                  )}
                </button>
                <button
                  className={`px-3 py-1 text-sm ${ratedSortBy === 'votes' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => {
                    if (ratedSortBy === 'votes') {
                      setRatedSortDir(toggleSortDirection(ratedSortDir));
                    } else {
                      setRatedSortBy('votes');
                      setRatedSortDir('asc'); // Initialiser avec tri ascendant
                    }
                  }}
                >
                  Votes
                  {ratedSortBy === 'votes' && (
                    <span className="ml-1">
                      {ratedSortDir === 'asc' ? '↑' : '↓'} {/* Flèche vers le haut en premier */}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {ratedPokemons.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedRated.map((pokemon, idx) => (
                <div
                  key={pokemon.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${idx % 2 === 0 ? "bg-gray-800" : "bg-gray-800/70"} hover:bg-gray-700 transition`}
                >
                  {/* Pokémon info with image, name and types */}
                  <Link href={`/pokemon/${pokemon.id}`} className="flex items-center gap-3 flex-grow hover:text-blue-400 transition">
                    <div className="w-12 h-12 bg-gray-700 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                      <Image
                        src={pokemon.sprites.front_default || '/images/pokeball.png'}
                        alt={pokemon.name}
                        width={48}
                        height={48}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/pokeball.png";
                        }}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1">
                        <span className="capitalize font-medium">{pokemon.name}</span>
                        {favorites.includes(pokemon.id) && (
                          <HeartIcon className="h-4 w-4 text-red-500" />
                        )}
                      </div>

                      {/* Types */}
                      <div className="flex gap-1 mt-1">
                        {pokemon.types?.map((typeObj, typeIdx) => {
                          const type = typeObj.type.name;
                          return (
                            <span
                              key={typeIdx}
                              className="badge px-1.5 py-0.5 text-xs text-white font-medium"
                              style={{ backgroundColor: typeColors[type] }}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </Link>

                  {/* Ratings section */}
                  <div className="flex items-center gap-6">
                    {/* User rating */}
                    <div className="flex flex-col items-center">
                      <div className="flex items-center mb-1">
                        <ClientStarRating value={userRatings[pokemon.id] || 0} fixed={true} size="sm" useColors={true} />
                      </div>
                    </div>

                    {/* Community rating */}
                    <div>
                      <CommunityRating
                        rating={pokemonCache[pokemon.id]?.rating || pokemon.rating || 0}
                        votes={pokemonCache[pokemon.id]?.numberOfVotes || pokemon.numberOfVotes || 0}
                        size="md"
                        showStars={false}
                        prominent={true}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {ratedPokemons.length > 30 && !showAllRated && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllRated(true)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white flex items-center justify-center w-full max-w-xs mx-auto transition"
                >
                  <span>Voir les {ratedPokemons.length - 30} autres Pokémon notés</span>
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}

            {showAllRated && ratedPokemons.length > 30 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllRated(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white flex items-center justify-center w-full max-w-xs mx-auto transition"
                >
                  <span>Réduire la liste</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400 mb-4">Vous n'avez pas encore noté de Pokémon.</p>
            <Link href="/explorer" className="btn btn-primary">
              Noter des Pokémon
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}