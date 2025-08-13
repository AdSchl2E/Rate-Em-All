import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Repository } from 'typeorm';
import { Pokemon } from './entities/pokemon.entity';
export declare class PokemonService {
    private readonly pokemonRepository;
    private readonly logger;
    constructor(pokemonRepository: Repository<Pokemon>);
    create(createPokemonDto: CreatePokemonDto): Promise<Pokemon>;
    findAll(): Promise<Pokemon[]>;
    findOne(id: number): Promise<Pokemon | null>;
    update(id: number, updatePokemonDto: UpdatePokemonDto): Promise<Pokemon>;
    remove(id: number): Promise<{
        id: number;
    }>;
    findByPokedexId(pokedexId: number): Promise<Pokemon | {
        rating: number;
        numberOfVotes: number;
    }>;
    ratePokemon(pokemonId: number, rating: number): Promise<Pokemon>;
    getTopRated(limit?: number): Promise<Pokemon[]>;
    getTrending(limit?: number): Promise<Pokemon[]>;
}
