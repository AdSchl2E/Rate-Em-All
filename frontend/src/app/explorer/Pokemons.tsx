'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Button from '../../components/buttons/Button';

interface Pokemon {
    id: number;
    name: string;
    sprites: {
        front_default: string;
        other: {
            'official-artwork': {
                front_default: string;
            };
        };
    };
    types: {
        type: {
            name: string;
            url: string;
        };
    }[];
}

const PAGE_SIZE = 20; // Nombre de Pokémon chargés à chaque requête

const Pokemons = () => {
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);
    const [ratings, setRatings] = useState<{ [key: number]: number }>({});
    const [offset, setOffset] = useState(0); // Pour garder la position dans l'API
    const [loading, setLoading] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);

    // Fonction pour récupérer les Pokémon par lot
    const fetchPokemons = useCallback(async () => {
        if (loading) return; // Évite les requêtes multiples

        setLoading(true);
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}&offset=${offset}`);
            const data = await response.json();

            const pokemonDetails = await Promise.all(
                data.results.map(async (pokemon: { url: string }) => {
                    const res = await fetch(pokemon.url);
                    return res.json();
                })
            );

            setPokemons((prev) => [...prev, ...pokemonDetails]);
            setOffset((prev) => prev + PAGE_SIZE);
        } catch (error) {
            console.error("Failed to fetch Pokémon:", error);
        } finally {
            setLoading(false);
        }
    }, [offset, loading]);

    // Détecter quand on est en bas de la page
    const lastPokemonRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    fetchPokemons();
                }
            });

            if (node) observer.current.observe(node);
        },
        [loading, fetchPokemons]
    );

    // Charger les premiers Pokémon au montage
    useEffect(() => {
        fetchPokemons();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Pokémons</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pokemons.map((pokemon, index) => (
                    <div
                        key={`${pokemon.id}-${index}`}  // Ajout d’un index pour éviter les doublons
                        className="bg-gray-800 shadow-md rounded-lg p-4"
                        ref={index === pokemons.length - 1 ? lastPokemonRef : null}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-xl">{pokemon.id}</div>
                            <div className="text-xl font-bold capitalize">{pokemon.name}</div>
                        </div>
                        <img
                            src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                            alt={pokemon.name}
                            className="mx-auto"
                        />
                        <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.5"
                            value={ratings[pokemon.id] || 0}
                            onChange={(e) => setRatings({ ...ratings, [pokemon.id]: parseFloat(e.target.value) })}
                            className="w-full mt-2"
                        />
                        <Button label='Rate' onClick={() => console.log(`Rated ${pokemon.id}`)} />
                        <Button label='Favorite' onClick={() => console.log(`Favorited ${pokemon.id}`)} />
                    </div>
                ))}

            </div>

            {loading && <p className="text-center my-4">Loading more Pokémon...</p>}
        </div>
    );
};

export default Pokemons;
