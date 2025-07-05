/**
 * Main application module that coordinates all other modules
 * Configures TypeORM database connection, JWT, and imports all feature modules
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PokemonModule } from './pokemon/pokemon.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');
        
        if (databaseUrl) {
          // Utiliser DATABASE_URL si disponible (production)
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [join(__dirname, '**', '*.entity.{ts,js}')],
            synchronize: true, // Ne pas utiliser en production !
          };
        }
        
        // Fallback vers les variables individuelles (développement)
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: +configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          entities: [join(__dirname, '**', '*.entity.{ts,js}')],
          synchronize: true, // Ne pas utiliser en production !
        };
      },
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    UserModule,
    PokemonModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
