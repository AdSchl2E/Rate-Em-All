/**
 * Main application file that bootstraps the NestJS application
 * Configures CORS settings and starts the HTTP server
 */
// Import polyfills before anything else
import './polyfills';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Bootstraps the NestJS application
 * Sets up CORS for frontend communication
 * Configures and starts the HTTP server
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ["http://localhost:3000"],
    credentials: true,
  });

  const configService = app.get(ConfigService);
  console.log("JWT_SECRET:", configService.get<string>('JWT_SECRET'));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
