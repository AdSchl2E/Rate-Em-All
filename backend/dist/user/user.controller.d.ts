import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<import("./entities/user.entity").User>;
    findAll(): Promise<import("./entities/user.entity").User[]>;
    getProfile(req: any): any;
    checkUsername(username: string, userIdParam: string): Promise<{
        available: boolean;
    }>;
    findByPseudo(pseudo: string): Promise<import("./entities/user.entity").User | null>;
    findOne(id: string): Promise<import("./entities/user.entity").User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("./entities/user.entity").User>;
    remove(id: string): Promise<{
        id: number;
    }>;
    findRatedPokemons(userId: string): Promise<number[]>;
    ratePokemon(req: any, userId: string, pokedexId: string, body: {
        rating: number;
    }): Promise<{
        message: string;
        pokemon: import("../pokemon/entities/pokemon.entity").Pokemon;
        userRating: import("../pokemon/entities/user-pokemon-rating.entity").UserPokemonRating;
        updatedRating: number;
        numberOfVotes: number;
    }>;
    setFavoritePokemon(userId: string, pokedexId: string): Promise<{
        isFavorite: boolean;
        pokemonName: any;
    }>;
    getUserFavoritePokemons(req: any, userId: string): Promise<{
        favorites: number[];
    }>;
    getUserRatings(req: any, userId: string): Promise<{
        ratings: {
            pokemonId: number;
            rating: number;
        }[];
    }>;
    checkIsFavorite(req: any, userId: string, pokedexId: string): Promise<{
        isFavorite: boolean;
    }>;
    toggleFavoritePokemon(userId: number, pokedexId: number): Promise<{
        isFavorite: boolean;
    }>;
    changePassword(req: any, userIdParam: string, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
    }>;
}
