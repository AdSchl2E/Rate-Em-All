'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Pokemon } from '../types/pokemon';
import { ratePokemonForUser, setFavoritePokemonForUser } from '../lib/api-client/pokemon';
import { getUserRatings } from '../lib/api-client/user';

interface GlobalContextProps {
    // Données
    pokemonCache: Record<number, Pokemon>;
    userRatings: Record<number, number>;
    favorites: number[];

    // Méthodes rating
    setRating: (pokemonId: number, rating: number) => Promise<{
        updatedRating: number;
        numberOfVotes: number;
    }>;
    getRating: (pokemonId: number) => number;
    hasRated: (pokemonId: number) => boolean;

    // Méthodes favoris
    toggleFavorite: (pokemonId: number) => Promise<boolean>;
    isFavorite: (pokemonId: number) => boolean;

    // État de chargement
    loading: boolean;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
    // Session utilisateur
    const { data: session, status } = useSession();
    const userId = session?.user?.id as number | undefined;
    const token = session?.accessToken as string | undefined;

    // États
    const [pokemonCache, setPokemonCache] = useState<Record<number, Pokemon>>({});
    const [userRatings, setUserRatings] = useState<Record<number, number>>({});
    const [favorites, setFavorites] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    // Chargement initial des données
    useEffect(() => {
        if (status === 'authenticated' && userId && token) {
            Promise.all([
                fetchUserRatings(),
                fetchUserFavorites()
            ]).then(() => {
                setLoading(false);
            }).catch((error) => {
                console.error('Error loading user data:', error);
                setLoading(false);
            });
        } else if (status === 'unauthenticated') {
            setUserRatings({});
            setFavorites([]);
            setLoading(false);
        }
    }, [status, userId, token]);

    // Récupérer les notes utilisateur
    const fetchUserRatings = async () => {
        if (!userId || !token) return;

        try {
            const response = await getUserRatings(userId, token);

            if (response && response.ratings) {
                const formattedRatings: Record<number, number> = {};

                response.ratings.forEach((item: any) => {
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

    // Récupérer les favoris utilisateur
    const fetchUserFavorites = async () => {
        if (!userId || !token) return;

        try {
            const response = await fetch(`/api/user/${userId}/favorite-pokemon`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch favorites');
            }

            const data = await response.json();

            if (data && Array.isArray(data.favorites)) {
                setFavorites(data.favorites);
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    // Méthodes pour les ratings
    const getRating = useCallback((pokemonId: number): number => {
        return userRatings[pokemonId] || 0;
    }, [userRatings]);

    const hasRated = useCallback((pokemonId: number): boolean => {
        return Object.prototype.hasOwnProperty.call(userRatings, pokemonId);
    }, [userRatings]);

    const setRating = async (pokemonId: number, rating: number): Promise<{
        updatedRating: number;
        numberOfVotes: number;
    }> => {
        if (!userId || !token) {
            throw new Error('User not authenticated');
        }

        try {
            const result = await ratePokemonForUser(userId, pokemonId, rating, token);

            // Mise à jour des ratings utilisateur
            setUserRatings(prev => ({
                ...prev,
                [pokemonId]: rating
            }));

            // Mise à jour immédiate du cache pokemon
            setPokemonCache(prev => ({
                ...prev,
                [pokemonId]: {
                    ...prev[pokemonId],
                    rating: result.updatedRating,
                    numberOfVotes: result.numberOfVotes
                }
            }));

            // Retourner directement les données mises à jour
            return {
                updatedRating: result.updatedRating,
                numberOfVotes: result.numberOfVotes
            };
        } catch (error) {
            console.error('Error setting rating:', error);
            throw error;
        }
    };

    // Méthodes pour les favoris
    const isFavorite = useCallback((pokemonId: number): boolean => {
        return favorites.includes(pokemonId);
    }, [favorites]);

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
            // Appeler l'API
            await setFavoritePokemonForUser(userId, pokemonId, token);
            return !isFav;
        } catch (error) {
            // Restaurer l'état précédent en cas d'erreur
            setFavorites(favorites);
            console.error('Error toggling favorite:', error);
            throw error;
        }
    };

    // Valeur du contexte
    const contextValue: GlobalContextProps = {
        pokemonCache,
        userRatings,
        favorites,
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