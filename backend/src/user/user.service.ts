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

  // Améliorer la méthode findOne pour vérifier la validité de l'ID
  async findOne(id: any): Promise<User | null> {
    // S'assurer que l'ID est un nombre valide
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    
    if (isNaN(numericId)) {
      console.warn(`ID utilisateur invalide fourni: ${id}`);
      return null;
    }
    
    try {
      return await this.usersRepository.findOne({
        where: { id: numericId }
      });
    } catch (error) {
      console.error(`Erreur lors de la recherche de l'utilisateur avec l'ID ${numericId}:`, error);
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
      } else {
        // Reset to 0 if this was the last vote
        pokemon.rating = 0;
      }
      
      pokemon.numberOfVotes = newNumberOfVotes;
      
      // Save the updated Pokémon
      await this.pokemonRepository.save(pokemon);
    }
    
    // Now delete all the user's ratings
    await this.userPokemonRatingRepository.delete({ userId: id });
    
    // Finally, delete the user
    await this.usersRepository.delete(id);

    return { id };
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
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
    // Récupère l'utilisateur
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} introuvable.`);
    }

    // Récupère le Pokémon par son Pokedex ID
    let pokemon = await this.pokemonRepository.findOne({ where: { pokedexId: pokedexId } })
    
    if (!pokemon) {
      // Si le Pokémon n'existe pas, on le crée avec sa première note
      pokemon = this.pokemonRepository.create({
        pokedexId,
        rating,
        numberOfVotes: 0,
      });
      await this.pokemonRepository.save(pokemon);
    }

    // Vérifie si l'utilisateur a déjà noté ce Pokémon
    let existingRating = await this.userPokemonRatingRepository.findOne({
      where: { 
        user: { id: user.id }, 
        pokemon: { id: pokemon.id } 
      }
    });

    if (existingRating) {
      // Mise à jour du vote utilisateur et recalcul de la note globale
      const totalBefore = pokemon.rating * pokemon.numberOfVotes;
      const newTotal = totalBefore - existingRating.rating + rating;
      pokemon.rating = newTotal / pokemon.numberOfVotes;

      await this.pokemonRepository.save(pokemon);
      existingRating.rating = rating;
      await this.userPokemonRatingRepository.save(existingRating);

      return { message: 'Rating updated', pokemon, userRating: existingRating };
    } else {
      // L'utilisateur n'a pas encore voté : ajout du vote et mise à jour du nombre de votes
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

      return { message: 'Rating created', pokemon, userRating: newRatingRecord };
    }
  }


  async setFavoritePokemon(userId: number, pokedexId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
        throw new Error('User not found');
    }

    // Obtenir le nom du Pokémon via l'API Pokémon
    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokedexId}`);
    const pokemonData = await pokemonResponse.json();
    const pokemonName = pokemonData.name;

    // Vérifie si le Pokémon est déjà dans la liste
    const index = user.favoritePokemons.indexOf(pokedexId);
    const isFavorite = index === -1;

    if (index !== -1) {
        // Si présent, on l'enlève
        user.favoritePokemons.splice(index, 1);
    } else {
        // Sinon, on l'ajoute
        user.favoritePokemons.push(pokedexId);
    }

    await this.usersRepository.save(user);

    // Retourne l'état du favori et le nom du Pokémon
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

  async login(email: string, password: string) {
    return await this.usersRepository.findOne({ where: { email, password } });
  }

  // Ajouter cette méthode à UserService
  async getUserRatings(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} introuvable.`);
    }

    // Récupérer toutes les notes de cet utilisateur
    const ratings = await this.userPokemonRatingRepository.find({
      where: { user: { id: userId } },
      relations: ['pokemon'],
    });

    // Formater les résultats
    return ratings.map(rating => ({
      pokemonId: rating.pokemon.pokedexId,
      rating: rating.rating,
    }));
  }

  // Ajouter cette méthode à UserService
  async checkIsFavorite(userId: number, pokedexId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} introuvable.`);
    }
    
    return user.favoritePokemons.includes(pokedexId);
  }

  async toggleFavoritePokemon(userId: number, pokedexId: number): Promise<{isFavorite: boolean}> {
    const user = await this.usersRepository.findOne({where: {id: userId}});
    
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} introuvable.`);
    }

    // Assurez-vous que les favoritePokemons est initialisé comme un tableau
    if (!Array.isArray(user.favoritePokemons)) {
      user.favoritePokemons = [];
    }

    const index = user.favoritePokemons.indexOf(pokedexId);
    let isFavorite = false;
    
    if (index > -1) {
      // Le Pokémon est déjà un favori, on le retire
      user.favoritePokemons.splice(index, 1);
      isFavorite = false;
    } else {
      // Le Pokémon n'est pas un favori, on l'ajoute
      user.favoritePokemons.push(pokedexId);
      isFavorite = true;
    }

    await this.usersRepository.save(user);
    console.log(`User ${userId} favorites updated: ${user.favoritePokemons}`);
    
    return { isFavorite };
  }

  async getUserFavoritePokemons(userId: number): Promise<number[]> {
    const user = await this.usersRepository.findOne({where: {id: userId}});
    
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} introuvable.`);
    }

    // Assurez-vous que favoritePokemons est défini
    return user.favoritePokemons || [];
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} introuvable.`);
    }
    
    // Vérifier que le mot de passe actuel est correct
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Le mot de passe actuel est incorrect');
    }
    
    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Mettre à jour le mot de passe
    user.password = hashedPassword;
    await this.usersRepository.save(user);
    
    return { success: true };
  }

  // Ajouter/améliorer la méthode findByUsername
  async findByUsername(username: string): Promise<User | null> {
    if (!username) return null;
    
    try {
      return await this.usersRepository.findOne({
        where: { name: username }
      });
    } catch (error) {
      console.error(`============================Erreur lors de la recherche de l'utilisateur avec le pseudo ${username}:`, error);
      return null;
    }
  }
}
