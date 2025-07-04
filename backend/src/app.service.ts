/**
 * Root service class for basic application functionality
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Returns a simple greeting message
   * @returns {string} Greeting message
   */
  getHello(): string {
    return 'Hello World!';
  }
}
