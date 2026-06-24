// [LEARN] UsersService gère les opérations sur les utilisateurs en base de données.
// [LEARN] Il est utilisé par AuthService pour trouver/créer des utilisateurs.
// [LEARN] On sépare Users et Auth en deux modules pour respecter le principe
// [LEARN] de responsabilité unique (SRP) : Users = gestion des données,
// [LEARN] Auth = gestion de l'authentification.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    // [LEARN] addSelect('user.password') est nécessaire car on a mis select:false
    // [LEARN] sur le champ password. On le récupère uniquement quand on en a besoin
    // [LEARN] (ici, pour vérifier le mot de passe lors de la connexion).
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(
    email: string,
    hashedPassword: string,
  ): Promise<UserEntity> {
    const user = this.usersRepository.create({ email, password: hashedPassword });
    return this.usersRepository.save(user);
  }
}
