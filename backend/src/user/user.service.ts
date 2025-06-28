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

  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  // Improve findOne method to check ID validity
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

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, updateUserDto);

    return await this.usersRepository.save(user);
  }

  async remove(id: number) {
    // First, get all ratings for this user
    const userRatings = await this.userPokemonRatingRepository.find({
      where: { userId: id },
      relations: ['pokemon']
    });

    // Update each Pokémon's community rating
    for (const userRating of userRatings) {
      const pokemon = userRating.pokemon;
      const userRatingValue = userRating.rating;

      // Calculate the new total rating
      const currentTotalScore = pokemon.rating * pokemon.numberOfVotes;
      const newNumberOfVotes = pokemon.numberOfVotes - 1;

      // Update the Pokémon rating and vote count
      if (newNumberOfVotes > 0) {
        // Calculate new average if there are still votes
        pokemon.rating = (currentTotalScore - userRatingValue) / newNumberOfVotes;
        pokemon.numberOfVotes = newNumberOfVotes;
        // Save the updated Pokémon
        await this.pokemonRepository.save(pokemon);
      } else {
        // Check if the Pokemon still has any ratings
        const hasRatings = await this.userPokemonRatingRepository.findOne({ where: { pokemonId: pokemon.id } });
        if (!hasRatings) {
          // If no ratings left, delete the Pokémon
          await this.pokemonRepository.delete(pokemon.id);
        }
        // Remove the Pokémon from the repository
        await this.pokemonRepository.remove(pokemon);
      }
    }

    // Now delete all the user's ratings
    await this.userPokemonRatingRepository.delete({ userId: id });

    // Finally, delete the user
    await this.usersRepository.delete(id);

    return { id };
  }

  async findByPseudo(pseudo: string) {
    return await this.usersRepository.findOne({ where: { pseudo } });
  }

  async findRatedPokemons(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    return user.ratedPokemons;
  }

  async ratePokemon(userId: number, pokedexId: number, rating: number) {
    // Get the user
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Get Pokemon by its Pokedex ID
    let pokemon = await this.pokemonRepository.findOne({ where: { pokedexId: pokedexId } });

    if (!pokemon) {
      // If Pokemon doesn't exist, create it with its first rating
      pokemon = this.pokemonRepository.create({
        pokedexId,
        rating,
        numberOfVotes: 0,
      });
      await this.pokemonRepository.save(pokemon);
    }

    // Check if user has already rated this Pokemon
    let existingRating = await this.userPokemonRatingRepository.findOne({
      where: {
        user: { id: user.id },
        pokemon: { id: pokemon.id }
      }
    });

    // Check if Pokemon is already in user's rated Pokemon list
    const ratedPokemonIndex = user.ratedPokemons.indexOf(pokedexId);

    if (existingRating) {
      // Update user's vote and recalculate global rating
      const totalBefore = pokemon.rating * pokemon.numberOfVotes;
      const newTotal = totalBefore - existingRating.rating + rating;
      pokemon.rating = newTotal / pokemon.numberOfVotes;

      await this.pokemonRepository.save(pokemon);
      existingRating.rating = rating;
      await this.userPokemonRatingRepository.save(existingRating);

      return { message: 'Rating updated', pokemon, userRating: existingRating };
    } else {
      // User hasn't voted yet: add vote and update vote count
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

      // Add Pokemon to user's rated Pokemon list if not already there
      if (ratedPokemonIndex === -1) {
        user.ratedPokemons.push(pokedexId);
        await this.usersRepository.save(user);
      }

      return { message: 'Rating created', pokemon, userRating: newRatingRecord };
    }
  }

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

  async findFavoritePokemons(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }
    return user.favoritePokemons;
  }

  async getUserRatings(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Get all ratings for this user
    const ratings = await this.userPokemonRatingRepository.find({
      where: { user: { id: userId } },
      relations: ['pokemon'],
    });

    // Format results
    return ratings.map(rating => ({
      pokemonId: rating.pokemon.pokedexId,
      rating: rating.rating,
    }));
  }

  async checkIsFavorite(userId: number, pokedexId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return user.favoritePokemons.includes(pokedexId);
  }

  async toggleFavoritePokemon(userId: number, pokedexId: number): Promise<{ isFavorite: boolean }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Ensure favoritePokemons is initialized as an array
    if (!Array.isArray(user.favoritePokemons)) {
      user.favoritePokemons = [];
    }

    const index = user.favoritePokemons.indexOf(pokedexId);
    let isFavorite = false;

    if (index > -1) {
      // Pokemon is already a favorite, remove it
      user.favoritePokemons.splice(index, 1);
      isFavorite = false;
    } else {
      // Pokemon is not a favorite, add it
      user.favoritePokemons.push(pokedexId);
      isFavorite = true;
    }

    await this.usersRepository.save(user);
    console.log(`User ${userId} favorites updated: ${user.favoritePokemons}`);

    return { isFavorite };
  }

  async getUserFavoritePokemons(userId: number): Promise<number[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Ensure favoritePokemons is defined
    return user.favoritePokemons || [];
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Verify current password is correct
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await this.usersRepository.save(user);

    return { success: true };
  }

  // Add/improve findByUsername method
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
