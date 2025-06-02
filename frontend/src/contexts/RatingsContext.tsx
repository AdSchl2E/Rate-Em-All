'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getUserRatings, ratePokemonForUser } from '../lib/api';
import { toast } from 'react-hot-toast';

interface RatingsContextType {
  ratings: Record<number, number>;
  setRating: (pokemonId: number, rating: number) => Promise<void>;
  hasRated: (pokemonId: number) => boolean;
  getRating: (pokemonId: number) => number;
  loading: boolean;
}

const RatingsContext = createContext<RatingsContextType | null>(null);

export const RatingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const userId = session?.user?.id as number | undefined;
  const accessToken = session?.accessToken;
  
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Charger les notes au chargement ou quand l'utilisateur change
  useEffect(() => {
    const fetchRatings = async () => {
      if (!userId || !accessToken) {
        setRatings({});
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching user ratings from context...');
        const data = await getUserRatings(userId, accessToken);
        
        const newRatings: Record<number, number> = {};
        if (data && Array.isArray(data.ratings)) {
          data.ratings.forEach((rating: { pokemonId: number, rating: number }) => {
            newRatings[rating.pokemonId] = rating.rating;
          });
          console.log('User ratings set:', Object.keys(newRatings).length, 'pokémons notés');
        } else {
          console.warn('Unexpected ratings format:', data);
        }
        
        setRatings(newRatings);
      } catch (error) {
        console.error('Error fetching user ratings:', error);
        toast.error("Erreur lors du chargement de vos notes");
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [userId, accessToken]);

  // Fonction pour noter un Pokémon
  const setRating = async (pokemonId: number, rating: number): Promise<void> => {
    if (!userId || !accessToken) {
      toast.error('Veuillez vous connecter pour noter ce Pokémon');
      return;
    }

    try {
      // Mise à jour optimiste
      const previousRating = ratings[pokemonId];
      
      // Mettre à jour l'UI immédiatement
      setRatings(prev => ({
        ...prev,
        [pokemonId]: rating
      }));
      
      // Appeler l'API
      await ratePokemonForUser(userId, pokemonId, rating, accessToken);
      
      toast.success(`Note de ${rating}/5 enregistrée !`);
    } catch (error) {
      console.error('Error setting rating:', error);
      
      // Restaurer l'état précédent en cas d'erreur
      setRatings(prev => ({
        ...prev,
        [pokemonId]: ratings[pokemonId] || 0
      }));
      
      toast.error("Erreur lors de la notation du Pokémon");
    }
  };

  // Fonction pour vérifier si un pokémon a été noté
  const hasRated = (pokemonId: number): boolean => {
    return !!ratings[pokemonId];
  };
  
  // Fonction pour récupérer la note d'un pokémon
  const getRating = (pokemonId: number): number => {
    return ratings[pokemonId] || 0;
  };

  const value = {
    ratings,
    setRating,
    hasRated,
    getRating,
    loading
  };

  return (
    <RatingsContext.Provider value={value}>
      {children}
    </RatingsContext.Provider>
  );
};

export const useRatings = () => {
  const context = useContext(RatingsContext);
  if (!context) {
    throw new Error('useRatings must be used within a RatingsProvider');
  }
  return context;
};