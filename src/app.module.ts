// [LEARN] Le AppModule est le module racine de l'application NestJS.
// [LEARN] C'est l'équivalent du AppModule Angular : il importe tous les autres modules
// [LEARN] et configure les services globaux (base de données, config, etc.).
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogModule } from './blog/blog.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    // [LEARN] ConfigModule charge le fichier .env et rend les variables disponibles
    // [LEARN] via ConfigService dans toute l'application. isGlobal:true évite de
    // [LEARN] réimporter ConfigModule dans chaque module enfant.
    ConfigModule.forRoot({ isGlobal: true }),

    // [LEARN] TypeOrmModule.forRootAsync permet de lire la config DB depuis .env
    // [LEARN] au lieu de la hardcoder. useFactory est une factory function :
    // [LEARN] NestJS l'appelle en lui injectant ConfigService.
    // [LEARN] Parallèle Angular : c'est comme un APP_INITIALIZER qui lit la config
    // [LEARN] avant de démarrer l'appli.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        // [LEARN] autoLoadEntities:true = TypeORM trouve automatiquement toutes les
        // [LEARN] entités enregistrées via forFeature() dans les modules enfants.
        // [LEARN] Plus besoin de lister les entités manuellement ici.
        autoLoadEntities: true,
        // [LEARN] synchronize:true = TypeORM met à jour le schéma DB automatiquement
        // [LEARN] à chaque démarrage. Pratique en dev, DANGEREUX en production
        // [LEARN] (peut supprimer des colonnes). On le désactivera avant le déploiement.
        synchronize: true,
        ssl:
          config.get<string>('DB_HOST') !== 'localhost'
            ? { rejectUnauthorized: false }
            : false,
      }),
      inject: [ConfigService],
    }),

    BlogModule,
    AuthModule,
    UsersModule,
    CartModule,
    OrdersModule,
  ],
})
export class AppModule {}
