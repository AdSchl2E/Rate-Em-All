'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Pokemon } from '../types/pokemon';
import { clientUser } from '@/lib/api/client';

/**
 * Structure for persistent cache
 */
interface PersistentCache {
  pokemon: Record<number, {
    data: Pokemon;
    timestamp: number;
  }>;
  ratings: Record<number, number>;
  favorites: number[];
  cacheTTL: number; // in milliseconds
}

/**
 * Simplified interface for the global context
 */
interface GlobalContextProps {
  // Data states
  pokemonCache: Record<number, Pokemon>; // Read-only accessible cache
  userRatings: Record<number, number>;   // User ratings
  favorites: number[];                   // Pokemon favorite IDs
  
  // Actions
  cachePokemon: (pokemon: Pokemon | Pokemon[]) => void; // Add Pokemon to cache
  setRating: (pokemonId: number, rating: number) => Promise<{
    updatedRating: number;
    numberOfVotes: number;
  }>;
  getRating: (pokemonId: number) => number;
  hasRated: (pokemonId: number) => boolean;
  toggleFavorite: (pokemonId: number) => Promise<boolean>;
  isFavorite: (pokemonId: number) => boolean;
  
  // UI state
  loading: boolean;
}

const CACHE_KEY = 'rate-em-all-cache';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

/**
 * Global provider component that manages application state
 * Handles Pokemon data caching, user ratings, and favorites
 * 
 * @param props - Component properties
 * @param props.children - Child components that will have access to the global context
 * @returns Provider component with global state
 */
export function GlobalProvider({ children }: { children: React.ReactNode }) {
  // User session
  const { data: session, status } = useSession();
  const userId = session?.user?.id as number | undefined;
  const token = session?.accessToken as string | undefined;

  // States
  const [pokemonCache, setPokemonCache] = useState<Record<number, Pokemon>>({});
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  
  // References to avoid unnecessary renders
  const isMounted = useRef(false);
  const initialLoadComplete = useRef(false);
  
  // Load cache on startup
  useEffect(() => {
    loadCache();
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load user data when session changes
  useEffect(() => {
    if (status === 'authenticated' && userId && token) {
      Promise.all([
        fetchUserRatings(),
        fetchUserFavorites()
      ]).then(() => {
        if (isMounted.current) setLoading(false);
        initialLoadComplete.current = true;
      }).catch((error) => {
        console.error('Error loading user data:', error);
        if (isMounted.current) setLoading(false);
      });
    } else if (status === 'unauthenticated') {
      setUserRatings({});
      setFavorites([]);
      if (isMounted.current) setLoading(false);
    }
  }, [status, userId, token]);

  // Save cache when it's modified
  useEffect(() => {
    // Only save if initial loading is complete
    if (initialLoadComplete.current) {
      saveCache();
    }
  }, [pokemonCache, userRatings, favorites]);

  /**
   * Load cache from localStorage
   */
  const loadCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return;

      const parsedCache: PersistentCache = JSON.parse(cached);
      const now = Date.now();
      const validCache: Record<number, Pokemon> = {};

      // Filter to keep only non-expired entries
      Object.entries(parsedCache.pokemon).forEach(([id, entry]) => {
        const pokemonId = Number(id);
        if (now - entry.timestamp < parsedCache.cacheTTL) {
          validCache[pokemonId] = entry.data;
        }
      });

      setPokemonCache(validCache);
      
      // Don't load ratings/favorites from cache if user is logged in
      // (we'll get them from the API)
      if (status !== 'authenticated') {
        setUserRatings(parsedCache.ratings || {});
        setFavorites(parsedCache.favorites || []);
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  };

  /**
   * Save cache to localStorage
   */
  const saveCache = () => {
    try {
      const now = Date.now();
      
      // Simplified Pokemon cache with only essential data
      let optimizedPokemonCache: Record<number, any> = {};
      
      // Process Pokemon objects to keep only essential data
      Object.entries(pokemonCache).forEach(([id, pokemon]) => {
        // Extract only essential species data if it exists
        const essentialSpeciesInfo = pokemon.species_info ? {
          is_legendary: pokemon.species_info.is_legendary,
          is_mythical: pokemon.species_info.is_mythical, 
          is_baby: pokemon.species_info.is_baby,
          generation: pokemon.species_info.generation ? 
            { name: pokemon.species_info.generation.name } : undefined,
          color: pokemon.species_info.color ? 
            { name: pokemon.species_info.color.name } : undefined,
          habitat: pokemon.species_info.habitat ? 
            { name: pokemon.species_info.habitat.name } : undefined
        } : undefined;
        
        optimizedPokemonCache[Number(id)] = {
          id: pokemon.id,
          name: pokemon.name,
          // Keep only type names, not the full objects
          types: pokemon.types.map(t => ({
            type: { name: t.type.name }
          })),
          // Keep only the essential sprite
          sprites: {
            other: {
              'official-artwork': {
                front_default: pokemon.sprites?.other?.['official-artwork']?.front_default
              }
            }
          },
          // Keep rating data
          rating: pokemon.rating,
          numberOfVotes: pokemon.numberOfVotes,
          // Add minimal species info
          species_info: essentialSpeciesInfo
        };
      });

      const cacheToSave: PersistentCache = {
        pokemon: Object.entries(optimizedPokemonCache).reduce((acc, [id, pokemon]) => {
          acc[Number(id)] = {
            data: pokemon,
            timestamp: now
          };
          return acc;
        }, {} as PersistentCache['pokemon']),
        ratings: userRatings,
        favorites: favorites,
        cacheTTL: DEFAULT_TTL
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheToSave));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
      
      // If we exceed the quota, try saving just user data
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        try {
          const minimalCache = {
            pokemon: {}, // Empty pokemon cache
            ratings: userRatings,
            favorites: favorites,
            cacheTTL: DEFAULT_TTL
          };
          localStorage.setItem(CACHE_KEY, JSON.stringify(minimalCache));
        } catch (fallbackError) {
          console.error('Even minimal cache failed to save:', fallbackError);
        }
      }
    }
  };

  /**
   * Add one or more Pokemon to the cache
   * @param pokemon - Pokemon object or array of Pokemon objects to cache
   */
  const cachePokemon = useCallback((pokemon: Pokemon | Pokemon[]) => {
    setPokemonCache(prev => {
      const newCache = { ...prev };
      
      if (Array.isArray(pokemon)) {
        pokemon.forEach(p => {
          newCache[p.id] = p;
        });
      } else {
        newCache[pokemon.id] = pokemon;
      }
      
      return newCache;
    });
  }, []);

  /**
   * Fetch user ratings from API
   */
  const fetchUserRatings = async () => {
    if (!userId || !token) return;

    try {
      // Use client API to get ratings
      const data = await clientUser.getUserRatings(userId);

      if (data && data.ratings) {
        const formattedRatings: Record<number, number> = {};

        data.ratings.forEach((item: any) => {
          const id = item.pokemonId || item.pokedexId;
          if (id && typeof item.rating === 'number') {
            formattedRatings[id] = item.rating;
          }
        });

        setUserRatings(formattedRatings);
      }
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    }
  };

  /**
   * Fetch user's favorite Pokemon from API
   */
  const fetchUserFavorites = async () => {
    if (!userId || !token) return;

    try {
      // Use client API to get favorites
      const data = await clientUser.getUserFavorites(userId);

      if (data && Array.isArray(data.favorites)) {
        setFavorites(data.favorites);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  /**
   * Check if user has rated a Pokemon
   * @param pokemonId - Pokemon ID to check
   * @returns True if the user has rated this Pokemon
   */
  const hasRated = useCallback((pokemonId: number): boolean => {
    return Object.prototype.hasOwnProperty.call(userRatings, pokemonId);
  }, [userRatings]);

  /**
   * Get user's rating for a Pokemon
   * @param pokemonId - Pokemon ID to get rating for
   * @returns Rating value (0-5) or 0 if not rated
   */
  const getRating = useCallback((pokemonId: number): number => {
    return userRatings[pokemonId] || 0;
  }, [userRatings]);

  /**
   * Set or update a Pokemon rating
   * @param pokemonId - Pokemon ID to rate
   * @param rating - Rating value (0-5)
   * @returns Object with updated community rating and vote count
   */
  const setRating = async (pokemonId: number, rating: number): Promise<{
    updatedRating: number;
    numberOfVotes: number;
  }> => {
    if (!userId || !token) {
      throw new Error('User not authenticated');
    }

    try {
      // Optimistic local update
      setUserRatings(prev => ({
        ...prev,
        [pokemonId]: rating
      }));

      // API call to rate the Pokemon
      const result = await clientUser.ratePokemon(pokemonId, rating, userId);

      // Update cache with new community data
      setPokemonCache(prev => {
        const pokemon = prev[pokemonId];
        if (pokemon) {
          return {
            ...prev,
            [pokemonId]: {
              ...pokemon,
              rating: result.updatedRating,
              numberOfVotes: result.numberOfVotes
            }
          };
        }
        return prev;
      });
      return result;
    } catch (error) {
      // In case of error, restore previous rating
      const previousRating = userRatings[pokemonId];
      setUserRatings(prev => ({
        ...prev,
        [pokemonId]: previousRating
      }));
      
      console.error('Error setting rating:', error);
      throw error;
    }
  };

  /**
   * Check if a Pokemon is in favorites
   * @param pokemonId - Pokemon ID to check
   * @returns True if the Pokemon is in favorites
   */
  const isFavorite = useCallback((pokemonId: number): boolean => {
    return favorites.includes(pokemonId);
  }, [favorites]);

  /**
   * Add or remove a Pokemon from favorites
   * @param pokemonId - Pokemon ID to toggle favorite status
   * @returns New favorite status (true if added, false if removed)
   */
  const toggleFavorite = async (pokemonId: number): Promise<boolean> => {
    if (!userId || !token) {
      throw new Error('User not authenticated');
    }

    // Optimistic update
    const isFav = favorites.includes(pokemonId);
    const newFavorites = isFav
      ? favorites.filter(id => id !== pokemonId)
      : [...favorites, pokemonId];

    setFavorites(newFavorites);

    try {
      // API call to update favorites
      const result = await clientUser.toggleFavorite(pokemonId, userId);
      return result.isFavorite;
    } catch (error) {
      // Restore in case of error
      setFavorites(favorites);
      console.error('Error toggling favorite:', error);
      throw error;
    }
  };

  const contextValue: GlobalContextProps = {
    pokemonCache,
    userRatings,
    favorites,
    cachePokemon,
    setRating,
    getRating,
    hasRated,
    toggleFavorite,
    isFavorite,
    loading
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
}

/**
 * Custom hook to access the global context
 * @returns Global context value
 * @throws Error if used outside of GlobalProvider
 */
export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
}