'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUserRatings } from '../lib/api-client/user';
import { ratePokemonForUser } from '../lib/api-client/pokemon';
import { useSession } from 'next-auth/react';
import { usePokemon } from './PokemonProvider';

interface RatingsContextProps {
  userRatings: Record<number, number> | null;
  loading: boolean;
  hasRated: (pokemonId: number) => boolean;
  getRating: (pokemonId: number) => number;
  setRating: (pokemonId: number, rating: number) => Promise<{
    updatedRating: number;
    numberOfVotes: number;
  }>;
  refreshRatings: () => Promise<void>;
}

const RatingsContext = createContext<RatingsContextProps | undefined>(undefined);

export function RatingsProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [userRatings, setUserRatings] = useState<Record<number, number> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { updatePokemon } = usePokemon(); // Ajout du hook usePokemon

  // Fetch ratings from API
  const fetchUserRatings = async () => {
    try {
      setLoading(true);
      
      if (!session?.user?.id) {
        console.log('No user ID in session, skipping rating fetch');
        setUserRatings(null);
        return;
      }
      
      const userId = Number(session.user.id);
      const token = session.accessToken as string;
      
      console.log(`Fetching ratings for user ${userId}`);
      
      // Récupération des notes depuis l'API
      const ratingsResponse = await getUserRatings(userId, token);
      console.log('Ratings response:', ratingsResponse);
      
      // Transformation du format API en format utilisable
      if (ratingsResponse && ratingsResponse.ratings) {
        // Format de l'API backend: { ratings: [{ pokemonId: 1, rating: 5 }, ...] }
        const formattedRatings: Record<number, number> = {};
        
        ratingsResponse.ratings.forEach((item: any) => {
          // Note: l'API semble utiliser "pokemonId" mais votre log montre aussi "pokedexId"
          const id = item.pokemonId || item.pokedexId;
          if (id && typeof item.rating === 'number') {
            formattedRatings[id] = item.rating;
          }
        });
        
        console.log('Formatted ratings:', formattedRatings);
        
        // Mettre à jour l'état
        setUserRatings(formattedRatings);
        
        // Sauvegarde en localStorage pour persistance
        if (typeof window !== 'undefined') {
          localStorage.setItem(`pokemon-ratings-${userId}`, JSON.stringify(formattedRatings));
          console.log('Saved ratings to localStorage');
        }
      } else {
        console.warn('Unexpected ratings format:', ratingsResponse);
        setUserRatings({});
      }
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
      
      // En cas d'erreur, essayer de charger depuis le localStorage
      if (session?.user?.id && typeof window !== 'undefined') {
        const savedRatings = localStorage.getItem(`pokemon-ratings-${session.user.id}`);
        if (savedRatings) {
          try {
            const parsedRatings = JSON.parse(savedRatings);
            console.log('Falling back to localStorage ratings');
            setUserRatings(parsedRatings);
          } catch (e) {
            console.error('Failed to parse localStorage ratings');
            setUserRatings({});
          }
        } else {
          setUserRatings({});
        }
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Initialisation: charger les données au chargement
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      // D'abord essayer de charger depuis le localStorage pour un affichage rapide
      if (typeof window !== 'undefined') {
        const savedRatings = localStorage.getItem(`pokemon-ratings-${session.user.id}`);
        if (savedRatings) {
          try {
            const parsedRatings = JSON.parse(savedRatings);
            console.log('Loaded ratings from localStorage');
            setUserRatings(parsedRatings);
          } catch (e) {
            console.error('Failed to parse localStorage ratings');
          }
        }
      }
      
      // Puis charger depuis l'API pour avoir les données à jour
      fetchUserRatings();
    } else if (status === 'unauthenticated') {
      setUserRatings(null);
      setLoading(false);
    }
  }, [session?.user?.id, status]);
  
  // Check if user has rated a pokemon
  const hasRated = (pokemonId: number): boolean => {
    if (!userRatings) return false;
    return Object.prototype.hasOwnProperty.call(userRatings, pokemonId);
  };
  
  // Get user rating for a pokemon
  const getRating = (pokemonId: number): number => {
    if (!userRatings) return 0;
    return userRatings[pokemonId] || 0;
  };
  
  // Set rating for a pokemon
  const setRating = async (pokemonId: number, rating: number): Promise<{
    updatedRating: number;
    numberOfVotes: number;
  }> => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    
    const userId = Number(session.user.id);
    const token = session.accessToken as string;
    
    try {
      // Appeler l'API pour sauvegarder la note et récupérer les données mises à jour
      const result = await ratePokemonForUser(userId, pokemonId, rating, token);
      
      // Mettre à jour l'état local avec la nouvelle note utilisateur
      setUserRatings(prev => {
        if (!prev) return { [pokemonId]: rating };
        return { ...prev, [pokemonId]: rating };
      });
      
      // Mettre à jour en localStorage
      if (typeof window !== 'undefined') {
        const storedRatings = localStorage.getItem(`pokemon-ratings-${userId}`);
        const ratings = storedRatings ? JSON.parse(storedRatings) : {};
        ratings[pokemonId] = rating;
        localStorage.setItem(`pokemon-ratings-${userId}`, JSON.stringify(ratings));
      }
      
      // Mettre à jour le cache global des Pokémon
      updatePokemon(pokemonId, {
        rating: result.updatedRating,
        numberOfVotes: result.numberOfVotes
      });
      
      // Retourner les informations mises à jour
      return {
        updatedRating: result.updatedRating,
        numberOfVotes: result.numberOfVotes
      };
      
    } catch (error) {
      console.error('Error setting rating:', error);
      throw error;
    }
  };
  
  // Refresh ratings
  const refreshRatings = async () => {
    await fetchUserRatings();
  };
  
  const contextValue = {
    userRatings,
    loading,
    hasRated,
    getRating,
    setRating,
    refreshRatings
  };
  
  return (
    <RatingsContext.Provider value={contextValue}>
      {children}
    </RatingsContext.Provider>
  );
}

export function useRatings() {
  const context = useContext(RatingsContext);
  if (context === undefined) {
    throw new Error('useRatings must be used within a RatingsProvider');
  }
  return context;
}