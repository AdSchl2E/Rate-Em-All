/**
 * Main application file that bootstraps the NestJS application
 * Configures CORS settings and starts the HTTP server
 */
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
  
  // CORS Configuration for production
  app.enableCors({
    origin: [
      'http://localhost:3000',  // Development
      'http://localhost:3001',  // Alternative dev
      process.env.FRONTEND_URL || 'http://localhost:3000', // Production Vercel URL
    ],
    credentials: true,
  });

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Port:', process.env.PORT);
  
  // Don't log JWT secret in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('JWT_SECRET:', configService.get<string>('JWT_SECRET'));
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend running on port ${port}`);
}
void bootstrap();
