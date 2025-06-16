'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Pokemon } from '../types/pokemon';
import { clientUser } from '@/lib/api/client';

// Structure pour le cache persistant
interface PersistentCache {
  pokemon: Record<number, {
    data: Pokemon;
    timestamp: number;
  }>;
  ratings: Record<number, number>;
  favorites: number[];
  cacheTTL: number; // en millisecondes
}

// Interface simplifiée pour le contexte
interface GlobalContextProps {
  // État des données
  pokemonCache: Record<number, Pokemon>; // Cache accessible en lecture seule
  userRatings: Record<number, number>;   // Notes de l'utilisateur
  favorites: number[];                   // IDs des Pokémon favoris
  
  // Actions
  cachePokemon: (pokemon: Pokemon | Pokemon[]) => void; // Ajouter des Pokémon au cache
  setRating: (pokemonId: number, rating: number) => Promise<{
    updatedRating: number;
    numberOfVotes: number;
  }>;
  getRating: (pokemonId: number) => number;
  hasRated: (pokemonId: number) => boolean;
  toggleFavorite: (pokemonId: number) => Promise<boolean>;
  isFavorite: (pokemonId: number) => boolean;
  
  // État UI
  loading: boolean;
}

const CACHE_KEY = 'rate-em-all-cache';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 heures

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  // User session
  const { data: session, status } = useSession();
  const userId = session?.user?.id as number | undefined;
  const token = session?.accessToken as string | undefined;

  // États
  const [pokemonCache, setPokemonCache] = useState<Record<number, Pokemon>>({});
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Référence pour éviter des rendus inutiles
  const isMounted = useRef(false);
  const initialLoadComplete = useRef(false);
  
  // Charger le cache au démarrage
  useEffect(() => {
    loadCache();
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Charger les données utilisateur quand la session change
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

  // Sauvegarde du cache quand il est modifié
  useEffect(() => {
    // Ne sauvegarder que si le chargement initial est terminé
    if (initialLoadComplete.current) {
      saveCache();
    }
  }, [pokemonCache, userRatings, favorites]);

  /**
   * Charge le cache depuis localStorage
   */
  const loadCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return;

      const parsedCache: PersistentCache = JSON.parse(cached);
      const now = Date.now();
      const validCache: Record<number, Pokemon> = {};

      // Filtrer pour ne garder que les entrées non expirées
      Object.entries(parsedCache.pokemon).forEach(([id, entry]) => {
        const pokemonId = Number(id);
        if (now - entry.timestamp < parsedCache.cacheTTL) {
          validCache[pokemonId] = entry.data;
        }
      });

      setPokemonCache(validCache);
      
      // Ne pas charger les ratings/favoris du cache si l'utilisateur est connecté
      // (on va les récupérer depuis l'API)
      if (status !== 'authenticated') {
        setUserRatings(parsedCache.ratings || {});
        setFavorites(parsedCache.favorites || []);
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  };

  /**
   * Sauvegarde le cache dans localStorage
   */
  const saveCache = () => {
    try {
      const now = Date.now();
      
      // Simplified Pokemon cache with only essential data
      let optimizedPokemonCache: Record<number, any> = {};
      
      // Process Pokemon objects to keep only essential data
      Object.entries(pokemonCache).forEach(([id, pokemon]) => {
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
          numberOfVotes: pokemon.numberOfVotes
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

      // Remove debug logging
      // console.log(localStorage.getItem(CACHE_KEY));

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
   * Ajoute un ou plusieurs Pokémon au cache
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
   * Récupère les notes de l'utilisateur depuis l'API
   */
  const fetchUserRatings = async () => {
    if (!userId || !token) return;

    try {
      // Utiliser l'API client pour récupérer les notes
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
   * Récupère les Pokémon favoris de l'utilisateur depuis l'API
   */
  const fetchUserFavorites = async () => {
    if (!userId || !token) return;

    try {
      // Utiliser l'API client pour récupérer les favoris
      const data = await clientUser.getUserFavorites(userId);

      if (data && Array.isArray(data.favorites)) {
        setFavorites(data.favorites);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  /**
   * Vérifie si l'utilisateur a noté un Pokémon
   */
  const hasRated = useCallback((pokemonId: number): boolean => {
    return Object.prototype.hasOwnProperty.call(userRatings, pokemonId);
  }, [userRatings]);

  /**
   * Récupère la note de l'utilisateur pour un Pokémon
   */
  const getRating = useCallback((pokemonId: number): number => {
    return userRatings[pokemonId] || 0;
  }, [userRatings]);

  /**
   * Définit ou met à jour la note d'un Pokémon
   */
  const setRating = async (pokemonId: number, rating: number): Promise<{
    updatedRating: number;
    numberOfVotes: number;
  }> => {
    if (!userId || !token) {
      throw new Error('User not authenticated');
    }

    try {
      // Mise à jour optimiste locale
      setUserRatings(prev => ({
        ...prev,
        [pokemonId]: rating
      }));

      // Appel API pour noter le pokémon
      const result = await clientUser.ratePokemon(pokemonId, rating, userId);

      // Mise à jour du cache avec les nouvelles données communautaires
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
      // En cas d'erreur, restaurer la note précédente
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
   * Vérifie si un Pokémon est dans les favoris
   */
  const isFavorite = useCallback((pokemonId: number): boolean => {
    return favorites.includes(pokemonId);
  }, [favorites]);

  /**
   * Ajoute ou retire un Pokémon des favoris
   */
  const toggleFavorite = async (pokemonId: number): Promise<boolean> => {
    if (!userId || !token) {
      throw new Error('User not authenticated');
    }

    // Mise à jour optimiste
    const isFav = favorites.includes(pokemonId);
    const newFavorites = isFav
      ? favorites.filter(id => id !== pokemonId)
      : [...favorites, pokemonId];

    setFavorites(newFavorites);

    try {
      // Appel API pour mettre à jour les favoris
      const result = await clientUser.toggleFavorite(pokemonId, userId);
      return result.isFavorite;
    } catch (error) {
      // Restaurer en cas d'erreur
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

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
}