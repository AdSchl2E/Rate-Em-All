/**
 * Pokemon entity
 * Represents a Pokemon in the database with rating information
 */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'pokemons' })
export class Pokemon {
  /** Unique identifier for the Pokemon in our database */
  @PrimaryGeneratedColumn()
  id: number;

  /** Unique Pokedex ID that corresponds to the Pokemon API ID */
  @Column({ unique: true })
  pokedexId: number;

  /** Average community rating from 0-5 */
  @Column({ type: 'float', default: 0 })
  rating: number;

  /** Total number of votes/ratings received */
  @Column({ default: 0 })
  numberOfVotes: number;
}
