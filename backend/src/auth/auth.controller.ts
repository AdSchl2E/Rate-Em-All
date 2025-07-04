/**
 * Authentication controller
 * Handles user registration and login
 */
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * @param {Object} body - Request body containing user credentials
   * @param {string} body.pseudo - Username for the new user
   * @param {string} body.password - Password for the new user
   * @returns {Promise<any>} Newly created user object
   */
  @Post('signup')
  async signup(@Body() body: { pseudo: string; password: string }) {
    return this.authService.signup(body.pseudo, body.password);
  }

  /**
   * Authenticate a user and return a JWT token
   * @param {Object} body - Request body containing user credentials
   * @param {string} body.pseudo - Username
   * @param {string} body.password - Password
   * @returns {Promise<{accessToken: string, id: number, pseudo: string, createdAt: Date, updatedAt: Date, ratedPokemons: number[], favoritePokemons: number[]}>}
   */
  @Post('login')
  async login(@Body() body: { pseudo: string; password: string }) {
    return this.authService.login(body.pseudo, body.password);
  }
}
