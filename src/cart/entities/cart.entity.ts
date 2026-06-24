// [LEARN] CartEntity représente le panier d'un utilisateur.
// [LEARN] Pourquoi un Cart séparé de User ? Parce que le panier a son propre cycle
// [LEARN] de vie : il se vide après une commande, peut exister sans items, etc.
// [LEARN] Le séparer de User garde les responsabilités bien découpées.
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { CartItemEntity } from './cart-item.entity';

@Entity('carts')
export class CartEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // [LEARN] ManyToOne : plusieurs paniers peuvent appartenir au même utilisateur.
  // [LEARN] En pratique on n'a qu'un panier actif par user, mais cette relation
  // [LEARN] nous permet de réinitialiser le panier sans perdre l'historique
  // [LEARN] (on créera simplement un nouveau cart après chaque commande).
  @ManyToOne(() => UserEntity, (user) => user.carts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => CartItemEntity, (item) => item.cart, { cascade: true })
  items: CartItemEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
