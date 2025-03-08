'use client';

import { useEffect, useState } from 'react';
import StarRating from '../components/stars/StarRating';

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

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Pokemons</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pokemons.map((pokemon) => (
                    <div key={pokemon.name} className="bg-gray-800 shadow-md rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-xl">{pokemon.id}</div>
                            <div className="text-xl font-bold capitalize">{pokemon.name}</div>
                        </div>
                        <img
                            src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                            alt={pokemon.name}
                            className="mx-auto"
                        />
                        <div className="text-center mt-2 mb-2 space-x-1">
                            {pokemon.types.map((type) => (
                                <img key={type.type.name} src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet/${type.type.url.split('/').slice(-2)[0]}.png`} alt={type.type.name} className="h-5 inline-block" />
                            ))}
                        </div>
                        <StarRating value={Math.floor(Math.random() * 10) + 1} fixed />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Pokemons;