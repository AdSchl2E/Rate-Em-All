/**
 * Root controller of the application
 * Handles basic routes for the application
 */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Basic root endpoint that returns a greeting message
   * @returns {string} Greeting message
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
