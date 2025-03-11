import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ["http://localhost:3000"], // Autorise Next.js
    credentials: true,
  });

  const configService = app.get(ConfigService);
  console.log("JWT_SECRET:", configService.get<string>('JWT_SECRET')); // Vérifier si la valeur est bien chargée

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
