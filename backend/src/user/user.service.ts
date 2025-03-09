import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

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

  async addFavoritePokemon(userId: number, pokemonId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    user.favoritePokemons.push(pokemonId);

    await this.userRepository.save(user);

    return user;
  }

  async removeFavoritePokemon(userId: number, pokemonId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    user.favoritePokemons = user.favoritePokemons.filter(
      (id) => id !== pokemonId,
    );

    await this.userRepository.save(user);

    return user;
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
