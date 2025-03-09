import { Injectable } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    @InjectRepository(Pokemon)
    private readonly pokemonRepository: Repository<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    const pokemon = this.pokemonRepository.create(createPokemonDto);

    return await this.pokemonRepository.save(pokemon);
  }

  async findAll() {
    return await this.pokemonRepository.find();
  }

  async findOne(id: number) {
    return await this.pokemonRepository.findOne({ where: { id } });
  }

  async update(id: number, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.pokemonRepository.findOne({ where: { id } });

    if (!pokemon) {
      throw new Error('Pokemon not found');
    }

    Object.assign(pokemon, updatePokemonDto);

    return await this.pokemonRepository.save(pokemon);
  }

  async remove(id: number) {
    await this.pokemonRepository.delete(id);

    return { id };
  }

  async findByName(name: string) {
    return await this.pokemonRepository.findOne({ where: { name } });
  }

  async findByPokedexId(pokedexId: number) {
    return await this.pokemonRepository.findOne({ where: { pokedexId } });
  }

  async ratePokemon(pokemonId: number, rating: number) {
    const pokemon = await this.pokemonRepository.findOne({ where: { id: pokemonId } });

    if (!pokemon) {
      throw new Error('Pokemon not found');
    }

    pokemon.rating = (pokemon.rating * pokemon.numberOfVotes + rating) / (pokemon.numberOfVotes + 1);
    pokemon.numberOfVotes++;

    return await this.pokemonRepository.save(pokemon);
  }

  async getRating(pokemonId: number) {
    const pokemon = await this.pokemonRepository.findOne({ where: { id: pokemonId } });

    if (!pokemon) {
      throw new Error('Pokemon not found');
    }

    return pokemon.rating;
  }

  async getNumberOfVotes(pokemonId: number) {
    const pokemon = await this.pokemonRepository.findOne({ where: { id: pokemonId } });

    if (!pokemon) {
      throw new Error('Pokemon not found');
    }

    return pokemon.numberOfVotes;
  }
}
