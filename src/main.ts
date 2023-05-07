import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cors from 'cors';
//const cors = require('cors');


async function bootstrap() {
   const app = await NestFactory.create(AppModule);
  //const app = await NestFactory.create<NestExpressApplication>(AppModule);
  //await app.listen(3000);
  //app.use(cors());
  app.enableCors();
  await app.listen(3301);

  // const corsOptions: CorsOptions = {
  //   origin: true, // permet toutes les demandes depuis n'importe quel domaine
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   preflightContinue: false,
  //   optionsSuccessStatus: 204,
  // };
  // app.enableCors(corsOptions); // activation de l'entête CORS


  // app.enableCors({
  //   origin: 'http://localhost:15460'
  // });
  // app.use(cors({
  //   origin: 'http://localhost:14535' // remplacez localhost:14535 par l'adresse de votre application React
  // }));

  // app.use(cors({
  //   origin: 'http://localhost:14535',
  //   methods: 'GET,PUT,POST,DELETE',
  //   allowedHeaders: 'Content-Type, Authorization',
  // }));
  // app.enableCors({
  //   origin: '*',
  //   methods: 'GET,PUT,POST,DELETE',
  //   allowedHeaders: 'Content-Type, Authorization',
  // });

}
bootstrap();
