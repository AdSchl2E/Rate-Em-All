/**
 * User entity
 * Represents a user in the database with authentication and Pokemon preferences
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  /** Unique identifier for the user */
  @PrimaryGeneratedColumn()
  id: number;

  /** Username (must be unique) */
  @Column({ unique: true })
  pseudo: string;

  /** Hashed password */
  @Column()
  password: string;

  /** Timestamp of user creation */
  @CreateDateColumn()
  createdAt: Date;

  /** Timestamp of last user update */
  @UpdateDateColumn()
  updatedAt: Date;

  /** Soft deletion timestamp */
  @DeleteDateColumn()
  deletedAt: Date;

  /** Array of Pokedex IDs of Pokemon rated by the user */
  @Column({ type: 'int', array: true, default: [] })
  ratedPokemons: number[];

  /** Array of Pokedex IDs of Pokemon favorited by the user */
  @Column({ type: 'int', array: true, default: [] })
  favoritePokemons: number[];
}
