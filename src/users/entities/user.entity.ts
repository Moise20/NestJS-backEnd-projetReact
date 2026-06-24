// [LEARN] Une entité TypeORM est une classe qui représente une table en base de données.
// [LEARN] Les décorateurs (@Entity, @Column, etc.) sont des métadonnées lues par TypeORM
// [LEARN] pour générer le schéma SQL. C'est comme les annotations JPA/Hibernate en Java.
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CartEntity } from '../../cart/entities/cart.entity';
import { OrderEntity } from '../../orders/entities/order.entity';

// [LEARN] L'enum Role permet de gérer les permissions : un ADMIN peut créer/modifier
// [LEARN] des articles, un USER peut seulement consulter, commander, etc.
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  // [LEARN] On ne stocke JAMAIS un mot de passe en clair. bcrypt transforme le mot de
  // [LEARN] passe en un hash (ex: "$2b$10$..."). Même si la DB est compromise,
  // [LEARN] l'attaquant ne peut pas retrouver le mot de passe original.
  // [LEARN] select:false = TypeORM n'inclut pas ce champ dans les SELECT par défaut,
  // [LEARN] ce qui évite d'exposer le hash par accident dans les réponses API.
  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  // [LEARN] Un utilisateur a un seul panier (OneToOne serait plus strict, mais OneToMany
  // [LEARN] nous permet de garder l'historique si on réinitialise le panier).
  @OneToMany(() => CartEntity, (cart) => cart.user)
  carts: CartEntity[];

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders: OrderEntity[];
}
