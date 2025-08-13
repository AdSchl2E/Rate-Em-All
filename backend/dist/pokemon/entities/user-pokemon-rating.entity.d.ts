import { User } from '../../user/entities/user.entity';
import { Pokemon } from './pokemon.entity';
export declare class UserPokemonRating {
    id: number;
    userId: number;
    pokemonId: number;
    rating: number;
    user: User;
    pokemon: Pokemon;
}
