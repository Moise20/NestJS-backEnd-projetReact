// [LEARN] OrderEntity représente une commande passée. C'est un snapshot immuable
// [LEARN] du panier au moment du paiement.
// [LEARN]
// [LEARN] Pourquoi ne pas juste référencer les articles du panier ?
// [LEARN] Parce que les prix changent ! Si un article passe de 29€ à 39€ demain,
// [LEARN] les anciennes commandes ne doivent pas être affectées. On stocke donc
// [LEARN] le prix UNITAIRE dans OrderItemEntity au moment de la commande.
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { OrderItemEntity } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => OrderItemEntity, (item) => item.order, { cascade: true })
  items: OrderItemEntity[];

  // [LEARN] On stocke le total en base pour éviter de le recalculer à chaque lecture.
  // [LEARN] type: 'decimal' est important pour les montants financiers —
  // [LEARN] les flottants (float) ont des problèmes de précision (0.1 + 0.2 ≠ 0.3).
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;
}
