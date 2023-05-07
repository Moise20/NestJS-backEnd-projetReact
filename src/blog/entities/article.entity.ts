import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CommentEntity } from "./comment.entity";
import { TagEntity } from "./tag.entity";

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

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'boolean', default: true })
    published: boolean

    // @Column({ type: 'int', default: 0 })
    // likes: number;
    @Column({ type: 'int', default: 0, nullable: true })
    likes: number | null;


    @OneToMany(type => CommentEntity, comment => comment.article)
    comments: CommentEntity[];

    @ManyToMany(type => TagEntity)
    @JoinTable({ name: 'articles_tags' })
    tags: TagEntity[];

}