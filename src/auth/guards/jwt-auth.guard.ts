// [LEARN] Un Guard NestJS répond à la question : "est-ce que cette requête
// [LEARN] a le droit d'accéder à cette route ?"
// [LEARN]
// [LEARN] Parallèle Angular : c'est EXACTEMENT l'équivalent d'un CanActivate Guard.
// [LEARN] En Angular : implements CanActivate → canActivate() retourne true/false
// [LEARN] En NestJS : extends AuthGuard('jwt') → Passport fait le travail
// [LEARN]
// [LEARN] On étend AuthGuard('jwt') de Passport plutôt qu'implémenter CanActivate
// [LEARN] directement, car Passport gère déjà l'extraction et la validation du token.
// [LEARN] On n'a qu'à décorer la route avec @UseGuards(JwtAuthGuard).
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
