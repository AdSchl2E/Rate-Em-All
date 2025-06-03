'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUserRatings } from '../lib/api-client/user';
import { ratePokemonForUser } from '../lib/api-client/pokemon';
import { useSession } from 'next-auth/react';

interface RatingsContextProps {
  userRatings: Record<number, number> | null;
  loading: boolean;
  hasRated: (pokemonId: number) => boolean;
  getRating: (pokemonId: number) => number;
  setRating: (pokemonId: number, rating: number) => Promise<void>;
  refreshRatings: () => Promise<void>;
}

const RatingsContext = createContext<RatingsContextProps | undefined>(undefined);

export function RatingsProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [userRatings, setUserRatings] = useState<Record<number, number> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch ratings from API
  const fetchUserRatings = async () => {
    try {
      setLoading(true);
      
      if (!session?.user?.id) {
        console.log('No user ID in session, skipping rating fetch');
        setUserRatings(null);
        return;
      }
      
      const userId = session.user.id;
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
  const setRating = async (pokemonId: number, rating: number): Promise<void> => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    
    const userId = session.user.id;
    const token = session.accessToken as string;
    const oldRating = getRating(pokemonId);
    
    try {
      // Mettre à jour l'état local immédiatement pour une meilleure UX
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
      
      // Appeler l'API pour sauvegarder la note
      await ratePokemonForUser(userId, pokemonId, rating, token);
      
      // Mise à jour visuelle des éléments DOM pour les notes globales
      updateDomRating(pokemonId, rating, oldRating, !hasRated(pokemonId));
      
    } catch (error) {
      console.error('Error setting rating:', error);
      
      // Rollback de l'état local en cas d'erreur
      setUserRatings(prev => {
        if (!prev) return {};
        const newState = { ...prev };
        if (oldRating) {
          newState[pokemonId] = oldRating;
        } else {
          delete newState[pokemonId];
        }
        return newState;
      });
      
      throw error;
    }
  };
  
  // Helper function to update DOM elements with new rating
  const updateDomRating = (pokemonId: number, newRating: number, oldRating: number, isNewRating: boolean) => {
    if (typeof document === 'undefined') return;
    
    // Mise à jour des cartes Pokémon
    const cards = document.querySelectorAll(`[data-pokemon-id="${pokemonId}"]`);
    cards.forEach(card => {
      const ratingElement = card.querySelector('[data-community-rating]');
      if (ratingElement) {
        const currentRating = parseFloat(ratingElement.getAttribute('data-rating') || '0');
        const voteCount = parseInt(ratingElement.getAttribute('data-votes') || '0');
        
        let newVoteCount = isNewRating ? voteCount + 1 : voteCount;
        let updatedRating = currentRating;
        
        if (isNewRating) {
          updatedRating = ((currentRating * voteCount) + newRating) / newVoteCount;
        } else {
          updatedRating = ((currentRating * voteCount) - oldRating + newRating) / voteCount;
        }
        
        ratingElement.setAttribute('data-rating', updatedRating.toString());
        ratingElement.setAttribute('data-votes', newVoteCount.toString());
        ratingElement.textContent = updatedRating.toFixed(1);
        
        const votesElement = card.querySelector('[data-vote-count]');
        if (votesElement) {
          votesElement.textContent = `(${newVoteCount})`;
        }
      }
    });
    
    // Mise à jour de la page de détail
    const detailElement = document.querySelector(`[data-detail-pokemon-id="${pokemonId}"]`);
    if (detailElement) {
      const ratingValue = detailElement.querySelector('.rating-value');
      const voteCount = detailElement.querySelector('.vote-count');
      
      if (ratingValue && voteCount) {
        const currentRating = parseFloat(detailElement.getAttribute('data-rating') || '0');
        const currentVotes = parseInt(detailElement.getAttribute('data-votes') || '0');
        
        let newVoteCount = isNewRating ? currentVotes + 1 : currentVotes;
        let updatedRating = currentRating;
        
        if (isNewRating) {
          updatedRating = ((currentRating * currentVotes) + newRating) / newVoteCount;
        } else {
          updatedRating = ((currentRating * currentVotes) - oldRating + newRating) / currentVotes;
        }
        
        detailElement.setAttribute('data-rating', updatedRating.toString());
        detailElement.setAttribute('data-votes', newVoteCount.toString());
        ratingValue.textContent = updatedRating.toFixed(1) + '/5';
        voteCount.textContent = `(${newVoteCount} votes)`;
      }
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