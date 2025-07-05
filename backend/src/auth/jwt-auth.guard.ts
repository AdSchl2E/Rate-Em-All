/**
 * JWT authentication guard
 * Validates JWT tokens in request headers and adds user data to the request
 * Used for protecting routes that require authentication
 */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Validates the JWT token from the request's Authorization header
   * Adds decoded user information to the request object if valid
   * @param {ExecutionContext} context - The execution context
   * @returns {boolean} Whether the request is authorized
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<any>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const authHeader = request.headers?.authorization;

    if (!authHeader) return false;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const token = authHeader.split(' ')[1];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
      const decoded = this.jwtService.verify(token);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      request.user = decoded;
      return true;
    } catch {
      return false;
    }
  }
}
