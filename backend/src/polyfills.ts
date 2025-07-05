/**
 * Polyfills for Node.js compatibility
 * Ensures that the crypto module is available globally
 */
import * as crypto from 'crypto';

// Make crypto available globally for NestJS/TypeORM
if (!global.crypto) {
  (global as any).crypto = crypto;
} 