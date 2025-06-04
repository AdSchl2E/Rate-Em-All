import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UnauthorizedException, NotFoundException, InternalServerErrorException, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Get('pseudo/:pseudo')
  findByPseudo(@Param('pseudo') pseudo: string) {
    return this.userService.findByPseudo(pseudo);
  }

  @Get(':userId/rated-pokemons')
  findRatedPokemons(@Param('userId') userId: string) {
    return this.userService.findRatedPokemons(+userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':userId/rate-pokemon/:pokedexId')
  async ratePokemon(
    @Req() req,
    @Param('userId') userId: string,
    @Param('pokedexId') pokedexId: string,
    @Body() body: { rating: number }
  ) {
    // Vérifie que l'utilisateur authentifié ne peut noter que pour lui-même.
    if (+userId !== req.user.id) {
      throw new UnauthorizedException("Vous ne pouvez pas noter pour un autre utilisateur");
    }
    return this.userService.ratePokemon(+userId, +pokedexId, body.rating);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':userId/favorite-pokemon/:pokedexId')
  async setFavoritePokemon(@Param('userId') userId: string, @Param('pokedexId') pokedexId: string) {
    const pokemonData = await this.userService.setFavoritePokemon(+userId, +pokedexId);
    return { 
      isFavorite: pokemonData.isFavorite,
      pokemonName: pokemonData.pokemonName // Ajout du nom pour les notifications
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/favorite-pokemon')
  async getUserFavoritePokemons(@Req() req, @Param('userId') userId: string) {
    // Vérifier que l'utilisateur ne peut accéder qu'à ses propres données
    if (+userId !== req.user.id) {
      throw new UnauthorizedException("Vous ne pouvez pas accéder aux favoris d'un autre utilisateur");
    }
    
    const favorites = await this.userService.getUserFavoritePokemons(+userId);
    return { favorites: Array.isArray(favorites) ? favorites : [] };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard) // Protège la route avec le guard JWT
  getProfile(@Req() req) {
    return req.user; // `user` est accessible grâce au JwtStrategy
  }

  // Ajouter cet endpoint au UserController
  @UseGuards(JwtAuthGuard)
  @Get(':userId/ratings')
  async getUserRatings(@Req() req, @Param('userId') userId: string) {
    // Vérifier que l'utilisateur ne peut accéder qu'à ses propres données
    if (+userId !== req.user.id) {
      throw new UnauthorizedException("Vous ne pouvez pas accéder aux notes d'un autre utilisateur");
    }
    const ratings = await this.userService.getUserRatings(+userId);
    return { ratings };
  }

  // Ajouter cet endpoint au UserController
  @UseGuards(JwtAuthGuard)
  @Get(':userId/favorite-pokemon/:pokedexId')
  async checkIsFavorite(@Req() req, @Param('userId') userId: string, @Param('pokedexId') pokedexId: string) {
    // Vérifier que l'utilisateur ne peut accéder qu'à ses propres données
    if (+userId !== req.user.id) {
      throw new UnauthorizedException("Vous ne pouvez pas accéder aux favoris d'un autre utilisateur");
    }
    
    const isFavorite = await this.userService.checkIsFavorite(+userId, +pokedexId);
    return { isFavorite };
  }

  @Post(':id/favorite-pokemon/:pokedexId')
  async toggleFavoritePokemon(
    @Param('id', ParseIntPipe) userId: number,
    @Param('pokedexId', ParseIntPipe) pokedexId: number
  ) {
    try {
      return await this.userService.toggleFavoritePokemon(userId, pokedexId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating favorite');
    }
  }
}
