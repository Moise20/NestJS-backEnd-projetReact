// [LEARN] ArticleEntity représente un produit du catalogue (présenté comme un article de blog).
// [LEARN] On y ajoute price et stock pour les fonctionnalités e-commerce.
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommentEntity } from './comment.entity';
import { TagEntity } from './tag.entity';

@Entity('articles')
export class ArticleEntity {
  @PrimaryGeneratedColumn({ name: 'article_id' })
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', name: 'corps' })
  body: string;

  @Column({ nullable: true })
  image: string;

  // [LEARN] type: 'decimal' est obligatoire pour les prix — les floats JavaScript
  // [LEARN] ont des erreurs de précision qui rendraient les calculs financiers faux.
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  // [LEARN] stock permet de désactiver le bouton "Ajouter au panier" côté frontend
  // [LEARN] quand un produit est épuisé. En production on ajouterait aussi
  // [LEARN] une vérification côté backend avant de confirmer une commande.
  @Column({ type: 'int', default: 0 })
  stock: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'boolean', default: true })
  published: boolean;

  @Column({ type: 'int', default: 0, nullable: true })
  likes: number | null;

  @OneToMany(() => CommentEntity, (comment) => comment.article)
  comments: CommentEntity[];

  @ManyToMany(() => TagEntity)
  @JoinTable({ name: 'articles_tags' })
  tags: TagEntity[];
}
