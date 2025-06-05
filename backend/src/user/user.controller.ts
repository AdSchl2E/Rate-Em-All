import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UnauthorizedException, NotFoundException, InternalServerErrorException, ParseIntPipe, Query, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Placez d'abord toutes les routes spécifiques
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }
  
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return req.user;
  }

  @Get('check-username')
  async checkUsername(
    @Query('username') username: string,
    @Query('userId') userIdParam: string
  ) {
    if (!username) {
      throw new BadRequestException('Le pseudo est requis');
    }
    
    let userId: number | null = null;
    
    if (userIdParam) {
      userId = parseInt(userIdParam);
      if (isNaN(userId)) {
        console.warn(`ID utilisateur invalide reçu: ${userIdParam}`);
        userId = null;
      }
    }
    
    console.log(`Vérification de la disponibilité du pseudo: ${username}, ID utilisateur: ${userId}`);
    const existingUser = await this.userService.findByUsername(username);
    const available = !existingUser || (userId !== null && existingUser.id === userId);
    
    return { available };
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Get('pseudo/:pseudo')
  findByPseudo(@Param('pseudo') pseudo: string) {
    return this.userService.findByPseudo(pseudo);
  }

  // Placez ensuite les routes avec paramètres dynamiques
  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log(`Recherche de l'utilisateur avec l'ID: ${id}`);
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

  @UseGuards(JwtAuthGuard)
  @Post(':userId/change-password')
  async changePassword(
    @Req() req,
    @Param('userId') userIdParam: string,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    // Conversion sécurisée de l'ID utilisateur
    const userId = parseInt(userIdParam);
    if (isNaN(userId)) {
      throw new BadRequestException('ID utilisateur invalide');
    }
    
    // Vérifier que l'utilisateur ne peut changer que son propre mot de passe
    if (userId !== req.user.id) {
      throw new UnauthorizedException("Vous ne pouvez pas changer le mot de passe d'un autre utilisateur");
    }
    
    try {
      return await this.userService.changePassword(userId, body.currentPassword, body.newPassword);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Erreur lors du changement de mot de passe:', error);
      throw new InternalServerErrorException('Erreur lors du changement de mot de passe');
    }
  }
}
