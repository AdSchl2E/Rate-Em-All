/**
 * Data Transfer Object for creating a new Pokemon
 * Contains all necessary properties to create a Pokemon record
 */
export class CreatePokemonDto {
  /** Unique Pokedex ID of the Pokemon */
  pokedexId: number;

  /** Average community rating value */
  rating: number;

  /** Total number of votes/ratings for this Pokemon */
  numberOfVotes: number;
}
