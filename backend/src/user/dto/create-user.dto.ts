/**
 * Data Transfer Object for creating a new User
 * Contains all necessary properties to create a User record
 */
export class CreateUserDto {
  /** Username of the user */
  pseudo: string;

  /** Password for user authentication (will be hashed before storage) */
  password: string;

  /** Array of Pokedex IDs of Pokemon rated by the user */
  ratedPokemons: number[];

  /** Array of Pokedex IDs of Pokemon favorited by the user */
  favoritePokemons: number[];
}
