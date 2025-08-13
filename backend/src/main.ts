/**
 * Main application file that bootstraps the NestJS application
 * Configures CORS settings and starts the HTTP server
 */
// Import polyfills before anything else
import './polyfills';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstraps the NestJS application
 * Sets up CORS for frontend communication
 * Configures and starts the HTTP server
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS Configuration for production
  app.enableCors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  });

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend running on port ${port}`);
}
void bootstrap();
