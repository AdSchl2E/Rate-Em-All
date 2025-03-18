import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity( { name: 'pokemons' } )
export class Pokemon {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    pokedexId: number;

    @Column({ type: 'float', default: 0 })
    rating: number

    @Column({ default: 0 })
    numberOfVotes: number;
}
