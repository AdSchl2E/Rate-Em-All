/**
 * User service
 * Handles business logic for user-related operations
 * Manages CRUD operations and specialized queries for user data
 */
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Pokemon } from '../pokemon/entities/pokemon.entity';
import { UserPokemonRating } from '../pokemon/entities/user-pokemon-rating.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Pokemon)
    private readonly pokemonRepository: Repository<Pokemon>,
    @InjectRepository(UserPokemonRating)
    private readonly userPokemonRatingRepository: Repository<UserPokemonRating>,
  ) { }

  /**
   * Create a new user
   * @param {CreateUserDto} createUserDto - Data for creating a new user
   * @returns {Promise<User>} Newly created user
   */
  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  /**
   * Get all users
   * @returns {Promise<User[]>} List of all users
   */
  async findAll() {
    return await this.usersRepository.find();
  }

  /**
   * Get user by ID
   * @param {any} id - User ID (string or number)
   * @returns {Promise<User|null>} Found user or null
   */
  async findOne(id: any): Promise<User | null> {
    // Ensure ID is a valid number
    const numericId = typeof id === 'string' ? parseInt(id) : id;

    if (isNaN(numericId)) {
      console.warn(`Invalid user ID provided: ${id}`);
      return null;
    }

    try {
      return await this.usersRepository.findOne({
        where: { id: numericId }
      });
    } catch (error) {
      console.error(`Error finding user with ID ${numericId}:`, error);
      throw error;
    }
  }

  /**
   * Update a user
   * @param {number} id - User ID to update
   * @param {UpdateUserDto} updateUserDto - Data for updating the user
   * @returns {Promise<User>} Updated user
   * @throws {Error} If user not found
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, updateUserDto);

    return await this.usersRepository.save(user);
  }

  /**
   * Delete a user
   * Updates Pokémon ratings by removing this user's contributions
   * @param {number} id - User ID to delete
   * @returns {Promise<{id: number}>} Deletion confirmation
   */
  async remove(id: number) {
    const userRatings = await this.userPokemonRatingRepository.find({
      where: { userId: id },
      relations: ['pokemon']
    });

    for (const userRating of userRatings) {
      const pokemon = userRating.pokemon;
      const userRatingValue = userRating.rating;

      const currentTotalScore = pokemon.rating * pokemon.numberOfVotes;
      const newNumberOfVotes = pokemon.numberOfVotes - 1;

      if (newNumberOfVotes > 0) {
        pokemon.rating = (currentTotalScore - userRatingValue) / newNumberOfVotes;
        pokemon.numberOfVotes = newNumberOfVotes;
        await this.pokemonRepository.save(pokemon);
      } else {
        const hasRatings = await this.userPokemonRatingRepository.findOne({ where: { pokemonId: pokemon.id } });
        if (!hasRatings) {
          await this.pokemonRepository.delete(pokemon.id);
        }
        await this.pokemonRepository.remove(pokemon);
      }
    }

    await this.userPokemonRatingRepository.delete({ userId: id });

    await this.usersRepository.delete(id);

    return { id };
  }

  /**
   * Find a user by username
   * @param {string} pseudo - Username to search for
   * @returns {Promise<User|null>} Found user or null
   */
  async findByPseudo(pseudo: string) {
    return await this.usersRepository.findOne({ where: { pseudo } });
  }

  /**
   * Find Pokemon rated by a user
   * @param {number} userId - User ID
   * @returns {Promise<number[]>} Array of Pokedex IDs of rated Pokemon
   * @throws {Error} If user not found
   */
  async findRatedPokemons(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    return user.ratedPokemons;
  }

  /**
   * Rate a Pokemon for a user
   * @param {number} userId - User ID
   * @param {number} pokedexId - Pokemon Pokedex ID
   * @param {number} rating - Rating value
   * @returns {Promise<any>} Rating result
   * @throws {NotFoundException} If user not found
   */
  async ratePokemon(userId: number, pokedexId: number, rating: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    let pokemon = await this.pokemonRepository.findOne({ where: { pokedexId: pokedexId } });

    if (!pokemon) {
      pokemon = this.pokemonRepository.create({
        pokedexId,
        rating,
        numberOfVotes: 0,
      });
      await this.pokemonRepository.save(pokemon);
    }

    let existingRating = await this.userPokemonRatingRepository.findOne({
      where: {
        user: { id: user.id },
        pokemon: { id: pokemon.id }
      }
    });

    const ratedPokemonIndex = user.ratedPokemons.indexOf(pokedexId);

    if (existingRating) {
      const totalBefore = pokemon.rating * pokemon.numberOfVotes;
      const newTotal = totalBefore - existingRating.rating + rating;
      pokemon.rating = newTotal / pokemon.numberOfVotes;

      await this.pokemonRepository.save(pokemon);
      existingRating.rating = rating;
      await this.userPokemonRatingRepository.save(existingRating);

      return { 
        message: 'Rating updated', 
        pokemon, 
        userRating: existingRating,
        updatedRating: pokemon.rating,
        numberOfVotes: pokemon.numberOfVotes
      };
    } else {
      const totalBefore = pokemon.rating * pokemon.numberOfVotes;

      pokemon.numberOfVotes++;
      pokemon.rating = (totalBefore + rating) / pokemon.numberOfVotes;

      await this.pokemonRepository.save(pokemon);

      const newRatingRecord = this.userPokemonRatingRepository.create({
        user,
        pokemon,
        rating,
      });
      await this.userPokemonRatingRepository.save(newRatingRecord);

      if (ratedPokemonIndex === -1) {
        user.ratedPokemons.push(pokedexId);
        await this.usersRepository.save(user);
      }

      return { 
        message: 'Rating created', 
        pokemon, 
        userRating: newRatingRecord,
        updatedRating: pokemon.rating,
        numberOfVotes: pokemon.numberOfVotes
      };
    }
  }

  /**
   * Set or unset a Pokemon as favorite for a user
   * @param {number} userId - User ID
   * @param {number} pokedexId - Pokemon Pokedex ID
   * @returns {Promise<{isFavorite: boolean, pokemonName: string}>} Favorite status and Pokemon name
   * @throws {Error} If user not found
   */
  async setFavoritePokemon(userId: number, pokedexId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    // Get Pokemon name from Pokemon API
    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokedexId}`);
    const pokemonData = await pokemonResponse.json();
    const pokemonName = pokemonData.name;

    // Check if Pokemon is already in the list
    const index = user.favoritePokemons.indexOf(pokedexId);
    const isFavorite = index === -1;

    if (index !== -1) {
      // If present, remove it
      user.favoritePokemons.splice(index, 1);
    } else {
      // Otherwise, add it
      user.favoritePokemons.push(pokedexId);
    }

    await this.usersRepository.save(user);

    // Return favorite status and Pokemon name
    return {
      isFavorite: isFavorite,
      pokemonName
    };
  }

  /**
   * Get favorite Pokemon for a user
   * @param {number} userId - User ID
   * @returns {Promise<number[]>} Array of Pokedex IDs of favorite Pokemon
   * @throws {Error} If user not found
   */
  async findFavoritePokemons(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }
    return user.favoritePokemons;
  }

  /**
   * Get ratings given by a user
   * @param {number} userId - User ID
   * @returns {Promise<{pokemonId: number, rating: number}[]>} User's ratings
   * @throws {NotFoundException} If user not found
   */
  async getUserRatings(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const ratings = await this.userPokemonRatingRepository.find({
      where: { user: { id: userId } },
      relations: ['pokemon'],
    });

    return ratings.map(rating => ({
      pokemonId: rating.pokemon.pokedexId,
      rating: rating.rating,
    }));
  }

  /**
   * Check if a Pokemon is in user's favorites
   * @param {number} userId - User ID
   * @param {number} pokedexId - Pokemon Pokedex ID
   * @returns {Promise<boolean>} Whether the Pokemon is favorited
   * @throws {NotFoundException} If user not found
   */
  async checkIsFavorite(userId: number, pokedexId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return user.favoritePokemons.includes(pokedexId);
  }

  /**
   * Toggle favorite status of a Pokemon for a user
   * @param {number} userId - User ID
   * @param {number} pokedexId - Pokemon Pokedex ID
   * @returns {Promise<{isFavorite: boolean}>} New favorite status
   * @throws {NotFoundException} If user not found
   */
  async toggleFavoritePokemon(userId: number, pokedexId: number): Promise<{ isFavorite: boolean }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    if (!Array.isArray(user.favoritePokemons)) {
      user.favoritePokemons = [];
    }

    const index = user.favoritePokemons.indexOf(pokedexId);
    let isFavorite = false;

    if (index > -1) {
      user.favoritePokemons.splice(index, 1);
      isFavorite = false;
    } else {
      user.favoritePokemons.push(pokedexId);
      isFavorite = true;
    }

    await this.usersRepository.save(user);
    console.log(`User ${userId} favorites updated: ${user.favoritePokemons}`);

    return { isFavorite };
  }

  /**
   * Get favorite Pokemon for a user
   * @param {number} userId - User ID
   * @returns {Promise<number[]>} Array of Pokedex IDs of favorite Pokemon
   * @throws {NotFoundException} If user not found
   */
  async getUserFavoritePokemons(userId: number): Promise<number[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return user.favoritePokemons || [];
  }

  /**
   * Change a user's password
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<{success: boolean}>} Password change result
   * @throws {NotFoundException} If user not found
   * @throws {UnauthorizedException} If current password is incorrect
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await this.usersRepository.save(user);

    return { success: true };
  }

  /**
   * Find a user by username
   * @param {string} username - Username to search for
   * @returns {Promise<User|null>} Found user or null
   */
  async findByUsername(username: string): Promise<User | null> {
    if (!username) return null;

    try {
      return await this.usersRepository.findOne({
        where: { pseudo: username }
      });
    } catch (error) {
      console.error(`Error finding user with username ${username}:`, error);
      return null;
    }
  }
}