import { Repository } from 'typeorm';
import { UserPokemonRating } from './entities/user-pokemon-rating.entity';
import { PokemonService } from './pokemon.service';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
export declare class PokemonController {
    private readonly pokemonService;
    private readonly userPokemonRatingRepository;
    constructor(pokemonService: PokemonService, userPokemonRatingRepository: Repository<UserPokemonRating>);
    create(createPokemonDto: CreatePokemonDto): Promise<import("./entities/pokemon.entity").Pokemon>;
    findAll(): Promise<import("./entities/pokemon.entity").Pokemon[]>;
    getTopRated(limit?: number): Promise<import("./entities/pokemon.entity").Pokemon[]>;
    getTrending(limit?: number): Promise<import("./entities/pokemon.entity").Pokemon[]>;
    findByPokedexId(pokedexId: string, userId?: number): Promise<{
        rating: number;
        numberOfVotes: number;
    } | {
        userRating: number;
        id: number;
        pokedexId: number;
        rating: number;
        numberOfVotes: number;
    } | {
        userRating: number;
        rating: number;
        numberOfVotes: number;
    }>;
    getPokemon(id: string): Promise<import("./entities/pokemon.entity").Pokemon | null>;
    update(id: string, updatePokemonDto: UpdatePokemonDto): Promise<import("./entities/pokemon.entity").Pokemon>;
    remove(id: string): Promise<{
        id: number;
    }>;
    ratePokemon(id: string, body: {
        rating: number;
    }): Promise<import("./entities/pokemon.entity").Pokemon>;
    getBatchRatings(idsParam: string): Promise<{}>;
}
