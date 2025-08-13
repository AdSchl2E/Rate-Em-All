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
async function createApp() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  await app.init();
  return app;
}

// Standard server mode (local/dev or when not running on Vercel)
async function bootstrap() {
  const app = await createApp();
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend running on port ${port}`);
}

// On Vercel, export a handler instead of listening on a port
let cachedServer: any;
export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    const app = await createApp();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer(req, res);
}

if (!process.env.VERCEL) {
  void bootstrap();
}
