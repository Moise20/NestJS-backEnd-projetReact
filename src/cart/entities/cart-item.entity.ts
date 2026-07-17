import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArticleEntity } from '../../blog/entities/article.entity';
import { CartEntity } from './cart.entity';

@Entity('cart_items')
export class CartItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CartEntity, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: CartEntity;

  @ManyToOne(() => ArticleEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'article_id' })
  article: ArticleEntity;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
