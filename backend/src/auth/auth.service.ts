/**
 * Authentication service
 * Handles user registration, authentication, and JWT token generation
 */
import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { race } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  /**
   * Register a new user
   * @param {string} pseudo - Username for the new user
   * @param {string} password - Plain text password to be hashed
   * @returns {Promise<any>} Newly created user object
   */
  async signup(pseudo: string, password: string) {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with hashed password
    return this.userService.create({
      pseudo,
      password: hashedPassword,
      ratedPokemons: [],
      favoritePokemons: [],
    });
  }

  /**
   * Authenticate a user and generate a JWT token
   * @param {string} pseudo - Username
   * @param {string} password - Password to verify
   * @returns {Promise<{accessToken: string, id: number, pseudo: string, createdAt: Date, updatedAt: Date, ratedPokemons: number[], favoritePokemons: number[]}>}
   * @throws {UnauthorizedException} If credentials are invalid
   */
  async login(pseudo: string, password: string) {
    const user = await this.userService.findByPseudo(pseudo);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { id: user.id, pseudo: user.pseudo };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      id: user.id,
      pseudo: user.pseudo,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      ratedPokemons: user.ratedPokemons,
      favoritePokemons: user.favoritePokemons,
    };
  }
}
