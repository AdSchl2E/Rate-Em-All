/**
 * User controller
 * Handles all HTTP requests related to user resources
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UnauthorizedException, NotFoundException, InternalServerErrorException, ParseIntPipe, Query, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Create a new user
   * @param {CreateUserDto} createUserDto - Data for creating a new user
   * @returns {Promise<any>} Newly created user
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * Get all users
   * @returns {Promise<any[]>} List of all users
   */
  @Get()
  findAll() {
    return this.userService.findAll();
  }
  
  /**
   * Get the profile of the authenticated user
   * @param {any} req - Request object containing the authenticated user
   * @returns {Promise<any>} User profile data
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return req.user;
  }

  /**
   * Check if a username is available
   * @param {string} username - Username to check
   * @param {string} userIdParam - Optional user ID to exclude from uniqueness check
   * @returns {Promise<{available: boolean}>} Whether the username is available
   * @throws {BadRequestException} If username is not provided
   */
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

  /**
   * Find a user by their username
   * @param {string} pseudo - Username to search for
   * @returns {Promise<any>} User data
   */
  @Get('pseudo/:pseudo')
  findByPseudo(@Param('pseudo') pseudo: string) {
    return this.userService.findByPseudo(pseudo);
  }

  /**
   * Get a user by ID
   * @param {string} id - User ID
   * @returns {Promise<any>} User data
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log(`Finding user with ID: ${id}`);
    return this.userService.findOne(+id);
  }

  /**
   * Update a user
   * @param {string} id - User ID to update
   * @param {UpdateUserDto} updateUserDto - Data for updating the user
   * @returns {Promise<any>} Updated user
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  /**
   * Delete a user
   * @param {string} id - User ID to delete
   * @returns {Promise<any>} Deletion confirmation
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  /**
   * Get Pokemon rated by a user
   * @param {string} userId - User ID
   * @returns {Promise<number[]>} Array of Pokedex IDs of rated Pokemon
   */
  @Get(':userId/rated-pokemons')
  findRatedPokemons(@Param('userId') userId: string) {
    return this.userService.findRatedPokemons(+userId);
  }

  /**
   * Rate a Pokemon as the authenticated user
   * @param {any} req - Request object containing authenticated user
   * @param {string} userId - User ID 
   * @param {string} pokedexId - Pokemon Pokedex ID
   * @param {Object} body - Rating data
   * @param {number} body.rating - Rating value
   * @returns {Promise<any>} Rating result
   * @throws {UnauthorizedException} If trying to rate for another user
   */
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

  /**
   * Set a Pokemon as favorite for a user
   * @param {string} userId - User ID
   * @param {string} pokedexId - Pokemon Pokedex ID
   * @returns {Promise<{isFavorite: boolean, pokemonName: string}>} Favorite status and Pokemon name
   */
  @UseGuards(JwtAuthGuard)
  @Post(':userId/favorite-pokemon/:pokedexId')
  async setFavoritePokemon(@Param('userId') userId: string, @Param('pokedexId') pokedexId: string) {
    const pokemonData = await this.userService.setFavoritePokemon(+userId, +pokedexId);
    return { 
      isFavorite: pokemonData.isFavorite,
      pokemonName: pokemonData.pokemonName
    };
  }

  /**
   * Get favorite Pokemon for authenticated user
   * @param {any} req - Request object containing authenticated user
   * @param {string} userId - User ID
   * @returns {Promise<{favorites: number[]}>} Array of Pokedex IDs of favorite Pokemon
   * @throws {UnauthorizedException} If trying to access another user's data
   */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/favorite-pokemon')
  async getUserFavoritePokemons(@Req() req, @Param('userId') userId: string) {
    if (+userId !== req.user.id) {
      throw new UnauthorizedException("You cannot access another user's favorites");
    }
    
    const favorites = await this.userService.getUserFavoritePokemons(+userId);
    return { favorites: Array.isArray(favorites) ? favorites : [] };
  }

  /**
   * Get user ratings for authenticated user
   * @param {any} req - Request object containing authenticated user
   * @param {string} userId - User ID
   * @returns {Promise<{ratings: any[]}>} User's Pokemon ratings
   * @throws {UnauthorizedException} If trying to access another user's data
   */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/ratings')
  async getUserRatings(@Req() req, @Param('userId') userId: string) {
    if (+userId !== req.user.id) {
      throw new UnauthorizedException("You cannot access another user's ratings");
    }
    const ratings = await this.userService.getUserRatings(+userId);
    return { ratings };
  }

  /**
   * Check if a Pokemon is in user's favorites
   * @param {any} req - Request object containing authenticated user
   * @param {string} userId - User ID
   * @param {string} pokedexId - Pokemon Pokedex ID
   * @returns {Promise<{isFavorite: boolean}>} Whether the Pokemon is favorited
   * @throws {UnauthorizedException} If trying to access another user's data
   */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/favorite-pokemon/:pokedexId')
  async checkIsFavorite(@Req() req, @Param('userId') userId: string, @Param('pokedexId') pokedexId: string) {
    if (+userId !== req.user.id) {
      throw new UnauthorizedException("You cannot access another user's favorites");
    }
    
    const isFavorite = await this.userService.checkIsFavorite(+userId, +pokedexId);
    return { isFavorite };
  }

  /**
   * Toggle favorite status of a Pokemon for a user
   * @param {number} userId - User ID
   * @param {number} pokedexId - Pokemon Pokedex ID
   * @returns {Promise<{isFavorite: boolean}>} New favorite status
   * @throws {NotFoundException} If user not found
   * @throws {InternalServerErrorException} If update fails
   */
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

  /**
   * Change user password
   * @param {any} req - Request object containing authenticated user
   * @param {string} userIdParam - User ID
   * @param {Object} body - Password change data
   * @param {string} body.currentPassword - Current password
   * @param {string} body.newPassword - New password
   * @returns {Promise<{success: boolean}>} Password change result
   * @throws {UnauthorizedException} If trying to change another user's password
   * @throws {BadRequestException} If user ID is invalid
   * @throws {InternalServerErrorException} If password change fails
   */
  @UseGuards(JwtAuthGuard)
  @Post(':userId/change-password')
  async changePassword(
    @Req() req,
    @Param('userId') userIdParam: string,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    const userId = parseInt(userIdParam);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    
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
