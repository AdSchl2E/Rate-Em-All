'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Pokemon } from '../types/pokemon';
import { api } from '@/lib/api';

/**
 * Interface simplifiée pour le contexte global
 */
interface GlobalContextProps {
  // Cache des Pokemon avec leurs données mises à jour
  pokemonCache: Record<number, Pokemon>;
  
  // Ratings de l'utilisateur
  userRatings: Record<number, number>;
  
  // Favoris de l'utilisateur  
  favorites: number[];
  
  // Actions
  cachePokemon: (pokemon: Pokemon | Pokemon[]) => void;
  updatePokemonRating: (pokemonId: number, newRating: number, newVoteCount: number) => void;
  setUserRating: (pokemonId: number, rating: number) => Promise<void>;
  getUserRating: (pokemonId: number) => number;
  getPokemonFromCache: (pokemonId: number) => Pokemon | undefined;
  toggleFavorite: (pokemonId: number) => Promise<boolean>;
  isFavorite: (pokemonId: number) => boolean;
  
  // État de chargement
  loading: boolean;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

/**
 * Provider simplifié pour l'état global
 */
export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  
  // États principaux
  const [pokemonCache, setPokemonCache] = useState<Record<number, Pokemon>>({});
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  
  const userId = session?.user?.id;
  const token = session?.accessToken;

  // Charger les données utilisateur au login
  useEffect(() => {
    if (status === 'authenticated' && userId && token) {
      loadUserData();
    } else if (status === 'unauthenticated') {
      // Reset user data when logged out
      setUserRatings({});
      setFavorites([]);
    }
  }, [status, userId, token]);

  /**
   * Charger toutes les données utilisateur
   */
  const loadUserData = async () => {
    if (!userId || !token) return;
    
    setLoading(true);
    try {
      // Charger ratings et favoris en parallèle - utiliser l'ID utilisateur réel
      const [ratingsData, favoritesData] = await Promise.all([
        api.user.getUserRatings(userId).catch((err) => {
          console.warn('Failed to load user ratings:', err);
          return { ratings: [] };
        }),
        api.user.getUserFavorites(userId).catch((err) => {
          console.warn('Failed to load user favorites:', err);
          return { favorites: [] };
        })
      ]);

      // Convertir les ratings en Record<number, number>
      const ratingsMap: Record<number, number> = {};
      if (ratingsData?.ratings) {
        ratingsData.ratings.forEach((rating: any) => {
          ratingsMap[rating.pokedexId || rating.pokemonId] = rating.rating;
        });
      }

      setUserRatings(ratingsMap);
      setFavorites(favoritesData?.favorites || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mettre en cache un ou plusieurs Pokemon
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
   * Mettre à jour la note communautaire d'un Pokemon
   */
  const updatePokemonRating = useCallback((pokemonId: number, newRating: number, newVoteCount: number) => {
    setPokemonCache(prev => {
      const pokemon = prev[pokemonId];
      if (pokemon) {
        return {
          ...prev,
          [pokemonId]: {
            ...pokemon,
            rating: newRating,
            numberOfVotes: newVoteCount
          }
        };
      }
      return prev;
    });
  }, []);

  /**
   * Noter un Pokemon
   */
  const setUserRating = useCallback(async (pokemonId: number, rating: number) => {
    if (!userId || !token) {
      throw new Error('User not authenticated');
    }

    try {
      // Mise à jour optimiste du rating utilisateur
      setUserRatings(prev => ({
        ...prev,
        [pokemonId]: rating
      }));

      // Appel API
      const result = await api.user.ratePokemon(pokemonId, rating, userId);

      // Mettre à jour la note communautaire
      updatePokemonRating(pokemonId, result.updatedRating, result.numberOfVotes);

    } catch (error) {
      // Annuler la mise à jour optimiste en cas d'erreur
      setUserRatings(prev => {
        const newRatings = { ...prev };
        delete newRatings[pokemonId];
        return newRatings;
      });
      throw error;
    }
  }, [userId, token, updatePokemonRating]);

  /**
   * Obtenir la note utilisateur pour un Pokemon
   */
  const getUserRating = useCallback((pokemonId: number): number => {
    return userRatings[pokemonId] || 0;
  }, [userRatings]);

  /**
   * Obtenir un Pokemon du cache
   */
  const getPokemonFromCache = useCallback((pokemonId: number): Pokemon | undefined => {
    return pokemonCache[pokemonId];
  }, [pokemonCache]);

  /**
   * Toggle favorite status
   */
  const toggleFavorite = useCallback(async (pokemonId: number): Promise<boolean> => {
    if (!userId || !token) {
      throw new Error('User not authenticated');
    }

    const isCurrentlyFavorite = favorites.includes(pokemonId);
    
    try {
      // Mise à jour optimiste
      setFavorites(prev => 
        isCurrentlyFavorite 
          ? prev.filter(id => id !== pokemonId)
          : [...prev, pokemonId]
      );

      // Appel API
      const result = await api.user.toggleFavorite(pokemonId, userId);
      return result.isFavorite;
    } catch (error) {
      // Annuler la mise à jour optimiste
      setFavorites(prev => 
        isCurrentlyFavorite 
          ? [...prev, pokemonId]
          : prev.filter(id => id !== pokemonId)
      );
      throw error;
    }
  }, [userId, token, favorites]);

  /**
   * Vérifier si un Pokemon est favori
   */
  const isFavorite = useCallback((pokemonId: number): boolean => {
    return favorites.includes(pokemonId);
  }, [favorites]);

  const value: GlobalContextProps = {
    pokemonCache,
    userRatings,
    favorites,
    cachePokemon,
    updatePokemonRating,
    setUserRating,
    getUserRating,
    getPokemonFromCache,
    toggleFavorite,
    isFavorite,
    loading
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte global
 */
export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
}