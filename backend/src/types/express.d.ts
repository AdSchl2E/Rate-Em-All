/**
 * Type declaration file for Express
 * Extends Express Request interface to include user property for authentication
 */

/**
 * Interface defining the JWT payload structure
 */
interface JwtPayload {
  /** User ID */
  id: number;

  /** Username */
  pseudo: string;

  /** JWT standard issue time */
  iat?: number;

  /** JWT standard expiration time */
  exp?: number;
}

declare module 'express' {
  interface Request {
    /** User object added by authentication middleware */
    user?: JwtPayload;
  }
}
