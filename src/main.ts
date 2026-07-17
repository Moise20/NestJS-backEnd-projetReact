// [LEARN] main.ts est le point d'entrée de l'application NestJS.
// [LEARN] Son rôle unique : créer l'application et démarrer le serveur HTTP.
// [LEARN] Parallèle Angular : c'est l'équivalent de main.ts dans Angular (bootstrapModule).
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // [LEARN] ValidationPipe active la validation automatique des DTOs.
  // [LEARN] Grâce à class-validator, si un champ obligatoire est manquant dans
  // [LEARN] le body d'une requête, NestJS renvoie automatiquement une 400 Bad Request.
  // [LEARN] whitelist:true = supprime les champs non déclarés dans le DTO (sécurité).
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // [LEARN] CORS = Cross-Origin Resource Sharing. Sans ça, le navigateur bloque
  // [LEARN] les requêtes du frontend (localhost:3000) vers le backend (localhost:3301)
  // [LEARN] car ils sont sur des ports différents = origines différentes.
  // [LEARN] On retire un éventuel '/' final : le header Origin envoyé par le navigateur
  // [LEARN] n'en a jamais, donc "https://x.com/" ne matcherait jamais "https://x.com".
  const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '') || '*';
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  const port = process.env.PORT || 3301;
  await app.listen(port);
}

bootstrap();
