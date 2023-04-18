import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleDto } from 'src/dtos/article.dto';
import { CommentDto } from 'src/dtos/comment.dto';
import { IntegerType, Repository } from 'typeorm';
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
        private readonly tagsRepository: Repository<TagEntity>


    ) { }

    getArticles(limit:number, offset: number) {
        return this.articlesRepository.find({ 
            skip:offset,
            take:limit, 
            relations: ['comments'] });
    }

    async getOneArticle(articleId: number) {
        const article = await this.articlesRepository.createQueryBuilder('article').where('article.id = :id', { id: articleId }).getOne();
        if (article) return article;
        return null;
    }

    async createdArticle(articleDto: ArticleDto) {
        const article = await this.articlesRepository.save(articleDto);
        return article;

    }

    async updateArticle(articleId: number, articleDto: ArticleDto) {

        const article = await this.articlesRepository.createQueryBuilder('article').where('article.id = :id', { id: articleId }).getOne();
        if (!article) return null;

        await this.articlesRepository.update(articleId, articleDto);
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

    async addTag(name: string) {
        let tag = new TagEntity();
        tag.name = name;
        tag = await this.tagsRepository.save(tag);
        if (tag) return tag;
        return null;
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

        // console.log(`Looking for article ${articleId}...`);
        // const article = await this.articlesRepository.createQueryBuilder('article')
        //     .leftJoinAndSelect('article.tags', 'tag')
        //     .where('article.id = :id', { id: articleId })
        //     .getOne();
        // console.log(`Found article: ${article}`);
        // if (!article) {
        //     console.log(`No article found with ID ${articleId}.`);
        //     return null;
        // }
        // console.log(`Looking for tag ${tagId}...`);
        // //const tag = await this.tagsRepository.findOne(tagId);
        // const tag = await this.tagsRepository.createQueryBuilder('tag')
        //     .where('tag.id = :id', { id: tagId })
        //     .getOne();

        // console.log(`Generated SQL query: ${this.tagsRepository.createQueryBuilder().select().where("id = :id", { id: tagId }).getSql()}`);

        // console.log(`Found tag: ${tag}`);
        // if (!tag) {
        //     console.log(`No tag found with ID ${tagId}.`);
        //     return null;
        // }
        // article.tags.push(tag);
        // await this.articlesRepository.save(article);
        // console.log(`Article ${articleId} updated with tag ${tagId}.`);
        // const updatedArticle = await this.articlesRepository
        //     .createQueryBuilder('article')
        //     .leftJoinAndSelect('article.tags', 'tag')
        //     .leftJoinAndSelect('article.comments', 'comment')
        //     .where('article.id = :id', { id: articleId })
        //     .getOne();
        // console.log(`Updated article: ${updatedArticle}`);
        // return updatedArticle;

    }

}
