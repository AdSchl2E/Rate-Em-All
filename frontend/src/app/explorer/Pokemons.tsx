'use client';

import { useEffect, useState } from 'react';
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

const Pokemons = () => {
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);
    const [ratings, setRatings] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        const fetchPokemons = async () => {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1700');
            const data = await response.json();
            const pokemonDetails = await Promise.all(
                data.results.map(async (pokemon: { url: string }) => {
                    const res = await fetch(pokemon.url);
                    return res.json();
                })
            );
            setPokemons(pokemonDetails);
        };
        fetchPokemons();
    }, []);

    const handleRate = async (pokemonId: number) => {
        const rating = ratings[pokemonId] || 0;
        try {
            const response = await fetch(`../api/pokemon/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pokemonId, rating })
            });
            if (!response.ok) throw new Error('Failed to rate Pokémon');
            alert(`Pokémon ${pokemonId} rated ${rating}/5!`);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFavorite = async (pokemonId: number) => {
        try {
            const response = await fetch(`../api/pokemon/favorite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pokemonId })
            });
            if (!response.ok) throw new Error('Failed to favorite Pokémon');
            alert(`Pokémon ${pokemonId} added to favorites!`);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Pokémons</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pokemons.map((pokemon) => (
                    <div key={pokemon.id} className="bg-gray-800 shadow-md rounded-lg p-4">
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
                        <Button label='Rate' onClick={() => handleRate(pokemon.id)} />
                        <Button label='Favorite' onClick={() => handleFavorite(pokemon.id)} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Pokemons;