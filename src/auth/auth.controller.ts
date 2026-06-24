// [LEARN] Le controller reçoit les requêtes HTTP et délègue au service.
// [LEARN] Il ne contient AUCUNE logique métier — uniquement du routing et de la
// [LEARN] validation d'entrée (déléguée au DTO + ValidationPipe).
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// [LEARN] @Controller('/auth') préfixe toutes les routes de cette classe.
// [LEARN] POST /auth/register et POST /auth/login seront les deux endpoints publics.
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    // [LEARN] @Body() extrait le corps JSON de la requête et le valide
    // [LEARN] automatiquement via le RegisterDto + ValidationPipe.
    return this.authService.register(dto.email, dto.password);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
