'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getUserFavoritePokemons, setFavoritePokemonForUser } from '../lib/api';
import { toast } from 'react-hot-toast';

interface FavoritesContextType {
  favorites: number[];
  toggleFavorite: (pokemonId: number) => Promise<boolean>;
  isFavorite: (pokemonId: number) => boolean;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const userId = session?.user?.id as number | undefined;
  const accessToken = session?.accessToken;
  
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Charger les favoris au chargement ou quand l'utilisateur change
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId || !accessToken) {
        setFavorites([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching favorites from context...');
        const data = await getUserFavoritePokemons(userId, accessToken);
        console.log('Favorites data:', data);
        
        if (data && Array.isArray(data.favorites)) {
          setFavorites(data.favorites);
          console.log('Favorites set:', data.favorites);
        } else {
          console.warn('Unexpected favorites format:', data);
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setFavorites([]);
        toast.error("Erreur lors du chargement des favoris");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userId, accessToken]);

  // Fonction pour ajouter/retirer des favoris
  const toggleFavorite = async (pokemonId: number): Promise<boolean> => {
    if (!userId || !accessToken) {
      toast.error('Veuillez vous connecter pour gérer vos favoris');
      return false;
    }

    try {
      // État optimiste avant réponse de l'API
      const currentlyIsFavorite = favorites.includes(pokemonId);
      
      // Mettre à jour l'UI immédiatement (optimistique)
      if (currentlyIsFavorite) {
        setFavorites(prev => prev.filter(id => id !== pokemonId));
      } else {
        setFavorites(prev => [...prev, pokemonId]);
      }
      
      // Appeler l'API
      const response = await setFavoritePokemonForUser(userId, pokemonId, accessToken);
      
      // Si la réponse ne correspond pas à notre mise à jour optimiste, corriger
      if (response && typeof response.isFavorite === 'boolean' && response.isFavorite !== !currentlyIsFavorite) {
        console.log('Correcting optimistic update with server response');
        if (response.isFavorite) {
          setFavorites(prev => prev.includes(pokemonId) ? prev : [...prev, pokemonId]);
        } else {
          setFavorites(prev => prev.filter(id => id !== pokemonId));
        }
      }
      
      return response.isFavorite;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Restaurer l'état précédent en cas d'erreur
      const currentlyIsFavorite = favorites.includes(pokemonId);
      if (currentlyIsFavorite) {
        setFavorites(prev => prev.includes(pokemonId) ? prev : [...prev, pokemonId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== pokemonId));
      }
      
      toast.error("Erreur lors de la mise à jour des favoris");
      return favorites.includes(pokemonId);
    }
  };

  // Fonction pour vérifier si un pokemon est favori
  const isFavorite = (pokemonId: number) => {
    return favorites.includes(pokemonId);
  };

  const value = {
    favorites,
    toggleFavorite,
    isFavorite,
    loading
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};