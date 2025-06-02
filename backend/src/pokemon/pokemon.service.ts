import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm'; // Ajout de l'import MoreThan
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  private readonly logger = new Logger(PokemonService.name);
  
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

  async findByPokedexId(pokedexId: number) {
    let pokemon = await this.pokemonRepository.findOne({ where: { pokedexId } });
    
    if (!pokemon) {
      return { rating: 0, numberOfVotes: 0 }; // Retourne des valeurs par défaut si le Pokémon n'existe pas
    }

    return pokemon;
    
  }

  async ratePokemon(pokemonId: number, rating: number) {
    // Rate a Pokemon
    // If the Pokemon does not exist, create it
    // If the Pokemon exists, update its rating 
    // and the number of votes

    let pokemon = await this.pokemonRepository.findOne({ where: { pokedexId: pokemonId } });

    console.log(pokemon);

    if (!pokemon) {
      pokemon = this.pokemonRepository.create({
        pokedexId: pokemonId,
        rating,
        numberOfVotes: 1,
      });

      return await this.pokemonRepository.save(pokemon);

    } else {
      
      const newRating = (pokemon.rating * pokemon.numberOfVotes + rating) / (pokemon.numberOfVotes + 1);
      pokemon.rating = newRating;
      pokemon.numberOfVotes++;

      return await this.pokemonRepository.save(pokemon);
    }
  }

  async getTopRated(limit: number = 10) {
    try {
      // Utilisation correcte des opérateurs TypeORM
      const pokemons = await this.pokemonRepository.find({
        where: { numberOfVotes: MoreThan(0) }, // Au moins 1 vote
        order: { rating: 'DESC' },
        take: limit,
      });
      
      this.logger.log(`Récupération de ${pokemons.length} Pokémon les mieux notés`);
      return pokemons;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des top rated: ${error.message}`);
      return []; // Retourne un tableau vide en cas d'erreur
    }
  }

  async getTrending(limit: number = 4) {
    try {
      // Utilisation correcte des opérateurs TypeORM
      const pokemons = await this.pokemonRepository.find({
        where: { numberOfVotes: MoreThan(0) }, // Au moins 1 vote
        order: { numberOfVotes: 'DESC', rating: 'DESC' }, // Combinaison nombre de votes et rating
        take: limit,
      });
      
      this.logger.log(`Récupération de ${pokemons.length} Pokémon tendances`);
      return pokemons;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des trending: ${error.message}`);
      return []; // Retourne un tableau vide en cas d'erreur
    }
  }
}
