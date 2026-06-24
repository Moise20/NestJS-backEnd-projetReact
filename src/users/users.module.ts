// [LEARN] Un Module NestJS regroupe une fonctionnalité : il déclare ses providers
// [LEARN] (services) et ses controllers, et exporte ce qu'il veut partager.
// [LEARN] Parallèle Angular : @NgModule avec declarations, providers, exports.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

@Module({
  // [LEARN] forFeature enregistre UserEntity dans ce module, ce qui permet
  // [LEARN] à TypeORM de créer la table 'users' et d'injecter le Repository.
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService],
  // [LEARN] exports permet à AuthModule d'utiliser UsersService sans le réimporter.
  exports: [UsersService],
})
export class UsersModule {}
