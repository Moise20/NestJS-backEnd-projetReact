// [LEARN] OrderItemEntity = une ligne de commande avec le prix figé au moment de l'achat.
// [LEARN] articleTitle et unitPrice sont des COPIES des données de l'article,
// [LEARN] pas des références. C'est voulu : si l'article est supprimé ou modifié,
// [LEARN] l'historique de commande reste intègre.
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  // [LEARN] On stocke l'ID de l'article pour référence, mais pas en foreign key stricte
  // [LEARN] (pas de ManyToOne) pour ne pas bloquer la suppression d'un article.
  @Column({ name: 'article_id', nullable: true })
  articleId: number;

  @Column()
  articleTitle: string;

  @Column({ nullable: true })
  articleImage: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;
}
