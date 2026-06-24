// [LEARN] AuthService contient toute la logique métier d'authentification.
// [LEARN] Le controller ne fait qu'appeler ce service — il ne contient pas de logique.
// [LEARN] Ce pattern (thin controller, fat service) est une convention NestJS/Spring.
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      // [LEARN] ConflictException = HTTP 409. On utilise les exceptions NestJS prédéfinies
      // [LEARN] plutôt que de construire la réponse manuellement. NestJS s'occupe du format.
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    // [LEARN] bcrypt.hash() transforme le mot de passe en hash.
    // [LEARN] Le "10" est le "salt rounds" : plus c'est élevé, plus c'est sécurisé
    // [LEARN] mais plus c'est lent. 10 est le compromis standard en production.
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(email, hashedPassword);

    return this.buildTokenResponse(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // [LEARN] On renvoie intentionnellement le même message pour "email inconnu"
      // [LEARN] et "mauvais mot de passe". Si on distinguait les deux, un attaquant
      // [LEARN] pourrait utiliser l'API pour énumérer les emails existants.
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    return this.buildTokenResponse(user.id, user.email);
  }

  // [LEARN] On extrait la création du token dans une méthode privée pour ne pas
  // [LEARN] se répéter (DRY - Don't Repeat Yourself).
  private buildTokenResponse(userId: number, email: string) {
    // [LEARN] Le payload JWT est ce qu'on stocke dans le token.
    // [LEARN] Il est lisible par quiconque a le token (c'est du base64, pas chiffré),
    // [LEARN] donc on n'y met jamais de données sensibles (pas de password, pas de
    // [LEARN] numéro de carte, etc.). On y met juste ce dont on a besoin pour
    // [LEARN] identifier l'utilisateur sans requête DB supplémentaire.
    // [LEARN] "sub" est la convention JWT pour le sujet (= l'ID utilisateur).
    const payload = { sub: userId, email };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: userId, email },
    };
  }
}
