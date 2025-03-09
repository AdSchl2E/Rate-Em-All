import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity( { name: 'pokemons' } )
export class Pokemon {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    pokedexId: number;

    @Column()
    name: string;

    @Column({ default: 0 })
    rating: number;

    @Column({ default: 0 })
    numberOfVotes: number;
}
