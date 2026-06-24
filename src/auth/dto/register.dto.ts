// [LEARN] Un DTO (Data Transfer Object) définit la forme des données attendues
// [LEARN] dans le body d'une requête. class-validator ajoute des décorateurs de
// [LEARN] validation. Couplé au ValidationPipe dans main.ts, NestJS valide
// [LEARN] automatiquement chaque requête avant d'appeler le controller.
// [LEARN] Parallèle Angular : c'est comme les Validators dans un FormGroup.
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;
}
