import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Pokemon } from '../pokemon/entities/pokemon.entity';
import { UserPokemonRating } from '../pokemon/entities/user-pokemon-rating.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Pokemon)
    private readonly pokemonRepository: Repository<Pokemon>,
    @InjectRepository(UserPokemonRating)
    private readonly userPokemonRatingRepository: Repository<UserPokemonRating>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);

    return await this.userRepository.save(user);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, updateUserDto);

    return await this.userRepository.save(user);
  }

  async remove(id: number) {
    await this.userRepository.delete(id);

    return { id };
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByPseudo(pseudo: string) {
    return await this.userRepository.findOne({ where: { pseudo } });
  }

  async findRatedPokemons(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    return user.ratedPokemons;
  }

  async ratePokemon(userId: number, pokedexId: number, rating: number) {
    // Récupère l'utilisateur
    const user = await this.userRepository.findOne({ where: { id: userId } });
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
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
        throw new Error('User not found');
    }

    // Vérifie si le Pokémon est déjà dans la liste
    const index = user.favoritePokemons.indexOf(pokedexId);

    if (index !== -1) {
        // Si présent, on l'enlève
        user.favoritePokemons.splice(index, 1);
    } else {
        // Sinon, on l'ajoute
        user.favoritePokemons.push(pokedexId);
    }

    await this.userRepository.save(user);

    // Retourne le nouvel état du favori (true = ajouté, false = retiré)
    return index === -1;
}


  async findFavoritePokemons(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }
    return user.favoritePokemons;
  }

  async login(email: string, password: string) {
    return await this.userRepository.findOne({ where: { email, password } });
  }
}
