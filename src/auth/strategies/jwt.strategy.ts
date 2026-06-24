// [LEARN] La JwtStrategy est le "décodeur" de token. Passport l'appelle automatiquement
// [LEARN] quand une route protégée reçoit une requête avec un token dans le header.
// [LEARN]
// [LEARN] Flux complet d'authentification :
// [LEARN] 1. Client envoie : Authorization: Bearer <token>
// [LEARN] 2. JwtAuthGuard intercepte la requête → délègue à Passport
// [LEARN] 3. Passport lit le header, extrait le token, vérifie la signature avec JWT_SECRET
// [LEARN] 4. Si valide : appelle validate() → l'objet retourné est injecté dans req.user
// [LEARN] 5. Le controller peut accéder à req.user via le décorateur @Request()
// [LEARN]
// [LEARN] Parallèle Angular : c'est comme un HttpInterceptor qui lit le token,
// [LEARN] mais côté serveur plutôt que côté client.
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      // [LEARN] ExtractJwt.fromAuthHeaderAsBearerToken() indique à Passport où
      // [LEARN] chercher le token dans la requête HTTP.
      // [LEARN] Il s'attend au header : Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  // [LEARN] validate() est appelé après que Passport a vérifié et décodé le token.
  // [LEARN] Le payload est ce qu'on a mis dans le token au moment de la connexion (login).
  // [LEARN] Ce qu'on retourne ici sera accessible dans le controller via req.user.
  validate(payload: { sub: number; email: string }) {
    return { id: payload.sub, email: payload.email };
  }
}
