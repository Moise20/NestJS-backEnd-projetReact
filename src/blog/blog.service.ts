import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleDto } from '../dtos/article.dto';
import { CommentDto } from '../dtos/comment.dto';
import { ArticleEntity } from './entities/article.entity';
import { CommentEntity } from './entities/comment.entity';
import { TagEntity } from './entities/tag.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articlesRepository: Repository<ArticleEntity>,

    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,

    @InjectRepository(TagEntity)
    private readonly tagsRepository: Repository<TagEntity>,
  ) {}

  getArticles(limit: number, offset: number) {
    return this.articlesRepository.find({
      skip: offset,
      take: limit,
      relations: ['comments'],
    });
  }

  async getOneArticle(articleId: number): Promise<ArticleEntity | null> {
    return this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.comments', 'comment')
      .leftJoinAndSelect('article.tags', 'tag')
      .where('article.id = :id', { id: articleId })
      .getOne();
  }

  async createdArticle(articleDto: ArticleDto, filePath: string): Promise<ArticleEntity> {
    const article = this.articlesRepository.create({
      title: articleDto.title,
      body: articleDto.body,
      image: filePath,
      price: articleDto.price ?? 0,
      stock: articleDto.stock ?? 0,
    });
    return this.articlesRepository.save(article);
  }

  async updateArticle(articleId: number, articleDto: ArticleDto): Promise<ArticleEntity | null> {
    const article = await this.articlesRepository.findOne({ where: { id: articleId } });
    if (!article) return null;

    await this.articlesRepository.update(articleId, {
      title: articleDto.title,
      body: articleDto.body,
      ...(articleDto.image && { image: articleDto.image }),
      ...(articleDto.price !== undefined && { price: articleDto.price }),
      ...(articleDto.stock !== undefined && { stock: articleDto.stock }),
    });

    return this.articlesRepository.findOne({ where: { id: articleId } });
  }

  async removeArticle(articleId: number): Promise<ArticleEntity | null> {
    const article = await this.articlesRepository.findOne({ where: { id: articleId } });
    if (!article) return null;
    await this.articlesRepository.remove(article);
    return article;
  }

  async addComment(articleId: number, commentDto: CommentDto): Promise<CommentEntity | null> {
    const article = await this.articlesRepository.findOne({ where: { id: articleId } });
    if (!article) return null;

    const comment = this.commentRepository.create({
      message: commentDto.message,
      article,
    });
    return this.commentRepository.save(comment);
  }

  async getCommentsCount(articleId: number): Promise<number | null> {
    const article = await this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.comments', 'comment')
      .where('article.id = :id', { id: articleId })
      .getOne();
    if (!article) return null;
    return article.comments.length;
  }

  async addTag(name: string): Promise<TagEntity> {
    const existing = await this.tagsRepository
      .createQueryBuilder('tag')
      .where('tag.name = :name', { name })
      .getOne();

    if (existing) return existing;

    const tag = this.tagsRepository.create({ name });
    return this.tagsRepository.save(tag);
  }

  async tagArticle(articleId: number, tagId: number): Promise<ArticleEntity | null> {
    const article = await this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.tags', 'tag')
      .where('article.id = :id', { id: articleId })
      .getOne();
    if (!article) return null;

    const tag = await this.tagsRepository
      .createQueryBuilder('tag')
      .where('tag.id = :id', { id: tagId })
      .getOne();
    if (!tag) return null;

    article.tags.push(tag);
    await this.articlesRepository.save(article);

    return this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.tags', 'tag')
      .leftJoinAndSelect('article.comments', 'comment')
      .where('article.id = :id', { id: articleId })
      .getOne();
  }

  async getArticleTags(articleId: number): Promise<ArticleEntity | null> {
    return this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.tags', 'tags')
      .where('article.id = :articleId', { articleId })
      .getOne();
  }

  async incrementArticleLikes(articleId: string): Promise<ArticleEntity | null> {
    const article = await this.articlesRepository
      .createQueryBuilder('article')
      .where('article.id = :id', { id: articleId })
      .getOne();
    if (!article) return null;

    article.likes = (article.likes ?? 0) + 1;
    return this.articlesRepository.save(article);
  }

  async getArticleLikes(articleId: string): Promise<number | null> {
    const article = await this.articlesRepository
      .createQueryBuilder('article')
      .where('article.id = :id', { id: articleId })
      .getOne();
    return article ? article.likes : null;
  }
}
