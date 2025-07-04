/**
 * UserPokemonRating entity
 * Represents the many-to-many relationship between users and Pokemon ratings
 * Stores individual user ratings for Pokemon
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Pokemon } from './pokemon.entity';

@Entity('user_pokemon_ratings')
export class UserPokemonRating {
  /** Unique identifier for this rating record */
  @PrimaryGeneratedColumn()
  id: number;

  /** Foreign key reference to the user who made this rating */
  @Column()
  userId: number;

  /** Foreign key reference to the Pokemon being rated */
  @Column()
  pokemonId: number;

  /** Rating value from 0-5 */
  @Column({ type: 'float' })
  rating: number;

  /** Relation to the User entity */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  /** Relation to the Pokemon entity */
  @ManyToOne(() => Pokemon)
  @JoinColumn({ name: 'pokemonId' })
  pokemon: Pokemon;
}
