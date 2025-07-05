/**
 * JWT strategy for Passport authentication
 * Configures how JWT tokens are extracted and validated
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructor for JWT strategy
   * Configures token extraction from the Authorization header and the secret key
   */
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * Validates the JWT payload after it has been verified
   * @param {any} payload - The decoded JWT payload
   * @returns {Promise<any>} The user object to be attached to the request
   * @throws {UnauthorizedException} If payload is invalid
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(payload: any) {
    if (!payload) throw new UnauthorizedException();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return payload; // User will be available via request.user
  }
}
