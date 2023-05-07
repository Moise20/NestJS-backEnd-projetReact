import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleDto } from 'src/dtos/article.dto';
import { CommentDto } from 'src/dtos/comment.dto';
import { IntegerType, Repository } from 'typeorm';
import { ArticleEntity } from './entities/article.entity';
import { CommentEntity } from './entities/comment.entity';
import { TagEntity } from './entities/tag.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as multer from 'multer';


@Injectable()
export class BlogService {



    constructor(
        @InjectRepository(ArticleEntity)
        private readonly articlesRepository: Repository<ArticleEntity>,

        @InjectRepository(CommentEntity)
        private readonly commentRepository: Repository<CommentEntity>,

        @InjectRepository(TagEntity)
        private readonly tagsRepository: Repository<TagEntity>


    ) { }

    getArticles(limit: number, offset: number) {
        return this.articlesRepository.find({
            skip: offset,
            take: limit,
            relations: ['comments']
        });
    }

    async getOneArticle(articleId: number) {
        const article = await this.articlesRepository.createQueryBuilder('article').where('article.id = :id', { id: articleId }).getOne();
        if (article) return article;
        return null;
    }

    async createdArticle(articleDto: ArticleDto, filePath: string) {
        const article = new ArticleEntity();
        article.title = articleDto.title;
        article.body = articleDto.body;
        article.image = filePath;
        const savedArticle = await this.articlesRepository.save(article);
        return savedArticle;
    }


    async updateArticle(articleId: number, articleDto: ArticleDto, imageId?: string) {

        const article = await this.articlesRepository.createQueryBuilder('article').where('article.id = :id', { id: articleId }).getOne();
        //    
        if (!article) {
            return null;
        }
        // Si un nouvel identifiant d'image a été généré, mettre à jour le champ image de l'article
        if (imageId) {
            articleDto.image = imageId;
        }
        await this.articlesRepository.update(articleId, articleDto);
        // Récupérer l'article mis à jour
        return await this.articlesRepository.createQueryBuilder('article').where('article.id = :id', { id: articleId }).getOne();
    }


    async removeArticle(articleId: number) {
        const article = await this.articlesRepository.createQueryBuilder('article').where('article.id = :id', { id: articleId }).getOne();
        if (!article) return null;

        this.articlesRepository.remove(article);
        return article;
    }

    async addComment(articleId, commentDto: CommentDto) {
        const article = await this.articlesRepository.createQueryBuilder('article')
            .leftJoinAndSelect('article.comments', 'comment').where('article.id = :id', { id: articleId }).getOne();
        if (!article) return null;
        const comment = new CommentEntity();
        comment.message = commentDto.message;
        comment.article = article;
        return this.commentRepository.save(comment);
    }

    async getCommentsCount(articleId: number) {
        const article = await this.articlesRepository.createQueryBuilder('article')
            .leftJoinAndSelect('article.comments', 'comment')
            .where('article.id = :id', { id: articleId })
            .getOne();
        if (!article) return null;
        return article.comments.length;
    }
    async addTag(name: string) {
        try {
            // Vérifier si un tag avec ce nom existe déjà en base de données
            //const existingTag = await this.tagsRepository.findOne({ name });
            const existingTag = await this.tagsRepository.createQueryBuilder('tag')
                .where('tag.name=:name', { name: name })
                .getOne();
            if (existingTag) {
                return existingTag;
            }

            // Créer un nouveau tag et le sauvegarder en base de données
            const tag = new TagEntity();
            tag.name = name;
            const savedTag = await this.tagsRepository.save(tag);

            return savedTag;
        } catch (error) {
            throw new Error(`Impossible d'ajouter le tag "${name}": ${error.message}`);
        }
    }


   

    async tagArticle(articleId, tagId) {
        const article = await this.articlesRepository.createQueryBuilder('article')
            .leftJoinAndSelect('article.tags', 'tag').where('article.id = :id', { id: articleId }).getOne();
        if (!article) return null;
        //const tag = await this.tagsRepository.findOne(tagId);
        const tag = await this.tagsRepository.createQueryBuilder('tag')
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

    async getArticleTags(articleId) {
        return await this.articlesRepository
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.tags', 'tags')
            .where('article.id = :articleId', { articleId })
            .getOne();
    }

    async incrementArticleLikes(articleId: string) {
       
        const article = await this.articlesRepository
            .createQueryBuilder('article')
            .where('article.id = :id', { id: articleId })
            .getOne();

        if (!article) {
            return null;
        }
        article.likes += 1;
        await this.articlesRepository.save(article) ;
        return article;
    }

    async getArticleLikes(articleId: string): Promise<number> {
       
        const article = await this.articlesRepository
            .createQueryBuilder('article')
            .where('article.id = :id', { id: articleId })
            .getOne();
        return article ? article.likes : null;
      }








}

