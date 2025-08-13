import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Pokemon } from '../pokemon/entities/pokemon.entity';
import { UserPokemonRating } from '../pokemon/entities/user-pokemon-rating.entity';
export declare class UserService {
    private usersRepository;
    private readonly pokemonRepository;
    private readonly userPokemonRatingRepository;
    constructor(usersRepository: Repository<User>, pokemonRepository: Repository<Pokemon>, userPokemonRatingRepository: Repository<UserPokemonRating>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: any): Promise<User | null>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: number): Promise<{
        id: number;
    }>;
    findByPseudo(pseudo: string): Promise<User | null>;
    findRatedPokemons(userId: number): Promise<number[]>;
    ratePokemon(userId: number, pokedexId: number, rating: number): Promise<{
        message: string;
        pokemon: Pokemon;
        userRating: UserPokemonRating;
        updatedRating: number;
        numberOfVotes: number;
    }>;
    setFavoritePokemon(userId: number, pokedexId: number): Promise<{
        isFavorite: boolean;
        pokemonName: any;
    }>;
    findFavoritePokemons(userId: number): Promise<number[]>;
    getUserRatings(userId: number): Promise<{
        pokemonId: number;
        rating: number;
    }[]>;
    checkIsFavorite(userId: number, pokedexId: number): Promise<boolean>;
    toggleFavoritePokemon(userId: number, pokedexId: number): Promise<{
        isFavorite: boolean;
    }>;
    getUserFavoritePokemons(userId: number): Promise<number[]>;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    findByUsername(username: string): Promise<User | null>;
}
