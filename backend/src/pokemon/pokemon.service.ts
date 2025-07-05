/**
 * Pokemon service
 * Handles business logic for Pokemon-related operations
 * Manages CRUD operations and specialized queries for Pokemon data
 */
import { Injectable, Logger } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  private readonly logger = new Logger(PokemonService.name);

  constructor(
    @InjectRepository(Pokemon)
    private readonly pokemonRepository: Repository<Pokemon>,
  ) {}

  /**
   * Create a new Pokemon
   * @param {CreatePokemonDto} createPokemonDto - Data for creating a new Pokemon
   * @returns {Promise<Pokemon>} Newly created Pokemon
   */
  async create(createPokemonDto: CreatePokemonDto) {
    const pokemon = this.pokemonRepository.create(createPokemonDto);

    return await this.pokemonRepository.save(pokemon);
  }

  /**
   * Get all Pokemon
   * @returns {Promise<Pokemon[]>} List of all Pokemon
   */
  async findAll() {
    return await this.pokemonRepository.find();
  }

  /**
   * Get Pokemon by ID
   * @param {number} id - The ID of the Pokemon to find
   * @returns {Promise<Pokemon>} Found Pokemon
   */
  async findOne(id: number) {
    return await this.pokemonRepository.findOne({ where: { id } });
  }

  /**
   * Update a Pokemon
   * @param {number} id - The ID of the Pokemon to update
   * @param {UpdatePokemonDto} updatePokemonDto - Data for updating the Pokemon
   * @returns {Promise<Pokemon>} Updated Pokemon
   * @throws {Error} If Pokemon not found
   */
  async update(id: number, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.pokemonRepository.findOne({ where: { id } });

    if (!pokemon) {
      throw new Error('Pokemon not found');
    }

    Object.assign(pokemon, updatePokemonDto);

    return await this.pokemonRepository.save(pokemon);
  }

  /**
   * Delete a Pokemon
   * @param {number} id - The ID of the Pokemon to delete
   * @returns {Promise<{id: number}>} Deletion confirmation
   */
  async remove(id: number) {
    await this.pokemonRepository.delete(id);

    return { id };
  }

  /**
   * Find Pokemon by Pokedex ID
   * @param {number} pokedexId - The Pokedex ID to find
   * @returns {Promise<Pokemon|{rating: number, numberOfVotes: number}>} Found Pokemon or default values
   */
  async findByPokedexId(pokedexId: number) {
    const pokemon = await this.pokemonRepository.findOne({
      where: { pokedexId },
    });

    if (!pokemon) {
      return { rating: 0, numberOfVotes: 0 };
    }

    return pokemon;
  }

  /**
   * Rate a Pokemon
   * Creates Pokemon if it doesn't exist or updates existing rating
   * @param {number} pokemonId - The Pokedex ID of the Pokemon
   * @param {number} rating - Rating value
   * @returns {Promise<Pokemon>} Updated Pokemon with new rating
   */
  async ratePokemon(pokemonId: number, rating: number) {
    let pokemon = await this.pokemonRepository.findOne({
      where: { pokedexId: pokemonId },
    });

    console.log(pokemon);

    if (!pokemon) {
      pokemon = this.pokemonRepository.create({
        pokedexId: pokemonId,
        rating,
        numberOfVotes: 1,
      });

      return await this.pokemonRepository.save(pokemon);
    } else {
      const newRating =
        (pokemon.rating * pokemon.numberOfVotes + rating) /
        (pokemon.numberOfVotes + 1);
      pokemon.rating = newRating;
      pokemon.numberOfVotes++;

      return await this.pokemonRepository.save(pokemon);
    }
  }

  /**
   * Get top rated Pokemon
   * @param {number} limit - Maximum number of Pokemon to return
   * @returns {Promise<Pokemon[]>} List of top rated Pokemon
   */
  async getTopRated(limit: number = 10) {
    try {
      const pokemons = await this.pokemonRepository.find({
        where: { numberOfVotes: MoreThan(0) },
        order: { rating: 'DESC' },
        take: limit,
      });

      this.logger.log(`Retrieving ${pokemons.length} top rated Pokemon`);
      return pokemons;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Error retrieving top rated Pokemon: ${error.message}`);
      return [];
    }
  }

  /**
   * Get trending Pokemon based on number of votes
   * @param {number} limit - Maximum number of Pokemon to return
   * @returns {Promise<Pokemon[]>} List of trending Pokemon
   */
  async getTrending(limit: number = 4) {
    try {
      const pokemons = await this.pokemonRepository.find({
        where: { numberOfVotes: MoreThan(0) },
        order: { numberOfVotes: 'DESC', rating: 'DESC' },
        take: limit,
      });

      this.logger.log(`Retrieving ${pokemons.length} trending Pokemon`);
      return pokemons;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Error retrieving trending Pokemon: ${error.message}`);
      return [];
    }
  }
}
