// [LEARN] AuthModule configure Passport et JwtModule pour l'ensemble de l'application.
// [LEARN] JwtModule.registerAsync lit JWT_SECRET depuis .env via ConfigService
// [LEARN] (même pattern que TypeOrmModule.forRootAsync dans app.module.ts).
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') as any },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  // [LEARN] On exporte JwtAuthGuard et JwtStrategy pour qu'ils soient utilisables
  // [LEARN] dans les autres modules (CartModule, OrdersModule, etc.).
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
