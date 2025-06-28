import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UnauthorizedException, NotFoundException, InternalServerErrorException, ParseIntPipe, Query, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Place specific routes first
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
      throw new BadRequestException('Username is required');
    }
    
    let userId: number | null = null;
    
    if (userIdParam) {
      userId = parseInt(userIdParam);
      if (isNaN(userId)) {
        console.warn(`Invalid user ID received: ${userIdParam}`);
        userId = null;
      }
    }
    
    console.log(`Checking username availability: ${username}, User ID: ${userId}`);
    const existingUser = await this.userService.findByUsername(username);
    const available = !existingUser || (userId !== null && existingUser.id === userId);
    
    return { available };
  }

  @Get('pseudo/:pseudo')
  findByPseudo(@Param('pseudo') pseudo: string) {
    return this.userService.findByPseudo(pseudo);
  }

  // Then place routes with dynamic parameters
  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log(`Finding user with ID: ${id}`);
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
    // Verify that authenticated user can only rate for themselves
    if (+userId !== req.user.id) {
      throw new UnauthorizedException("You cannot rate for another user");
    }
    return this.userService.ratePokemon(+userId, +pokedexId, body.rating);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':userId/favorite-pokemon/:pokedexId')
  async setFavoritePokemon(@Param('userId') userId: string, @Param('pokedexId') pokedexId: string) {
    const pokemonData = await this.userService.setFavoritePokemon(+userId, +pokedexId);
    return { 
      isFavorite: pokemonData.isFavorite,
      pokemonName: pokemonData.pokemonName // Add name for notifications
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/favorite-pokemon')
  async getUserFavoritePokemons(@Req() req, @Param('userId') userId: string) {
    // Verify that user can only access their own data
    if (+userId !== req.user.id) {
      throw new UnauthorizedException("You cannot access another user's favorites");
    }
    
    const favorites = await this.userService.getUserFavoritePokemons(+userId);
    return { favorites: Array.isArray(favorites) ? favorites : [] };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/ratings')
  async getUserRatings(@Req() req, @Param('userId') userId: string) {
    // Verify that user can only access their own data
    if (+userId !== req.user.id) {
      throw new UnauthorizedException("You cannot access another user's ratings");
    }
    const ratings = await this.userService.getUserRatings(+userId);
    return { ratings };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/favorite-pokemon/:pokedexId')
  async checkIsFavorite(@Req() req, @Param('userId') userId: string, @Param('pokedexId') pokedexId: string) {
    // Verify that user can only access their own data
    if (+userId !== req.user.id) {
      throw new UnauthorizedException("You cannot access another user's favorites");
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
    // Safe conversion of user ID
    const userId = parseInt(userIdParam);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    
    // Verify that user can only change their own password
    if (userId !== req.user.id) {
      throw new UnauthorizedException("You cannot change another user's password");
    }
    
    try {
      return await this.userService.changePassword(userId, body.currentPassword, body.newPassword);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Error changing password:', error);
      throw new InternalServerErrorException('Error changing password');
    }
  }
}
