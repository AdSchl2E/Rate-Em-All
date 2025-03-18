import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Pokemon } from './pokemon.entity';

@Entity('user_pokemon_ratings')
export class UserPokemonRating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  pokemonId: number;

  @Column({ type: 'float' })
  rating: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Pokemon)
  @JoinColumn({ name: 'pokemonId' })
  pokemon: Pokemon;
}
