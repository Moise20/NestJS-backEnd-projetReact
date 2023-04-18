import { Body, Controller, Delete, Get, HttpException, HttpStatus, Logger, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ArticleDto } from 'src/dtos/article.dto';
import { CommentDto } from 'src/dtos/comment.dto';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {

    constructor(private readonly blogService:BlogService){}
    @Get()
    getAll(@Query('limit')limit=10,@Query('offset') offset=0){
        Logger.log('get all articles','BlogController');
        return this.blogService.getArticles(limit,offset);
    }

    @Get(':articleId')
    async getOne(@Param('articleId') articleId){
        Logger.log('Get one article', 'BlogController');
        const article =await  this.blogService.getOneArticle(articleId);
        if(article)
        return article; 
        throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    @Post()
    async create(@Body() articleDto: ArticleDto){
        Logger.log('create an article','BlogController');
        const article = await this.blogService.createdArticle(articleDto);

        if(article) return article;
        throw new HttpException('Not created',HttpStatus.NOT_MODIFIED);
    }

    @Put(':articleId')
    async update(@Param('articleId') articleId, @Body() articleDto){
       Logger.log('Update an article', 'BlogController');
       const article = await this.blogService.updateArticle(articleId, articleDto);

       if(article) return article;
       throw new HttpException('Not modified',HttpStatus.NOT_MODIFIED);
    }

    @Delete(':articleId')
    async remove(@Param('articleId') articleId){
        Logger.log('Update an article','BlogController');
        const article = await this.blogService.removeArticle(articleId);

        if(article) return article;
        throw new HttpException('Not Found',HttpStatus.NOT_MODIFIED);
    }

    @Post('comment/:articleId')
    async addComment(@Param('articleId') articleid, @Body() commentDto: CommentDto){
        const comment = await this.blogService.addComment(articleid,commentDto);
        if(comment) return comment;
        throw new HttpException('Not modified',HttpStatus.NOT_MODIFIED);

    };

    @Post('tag/:tagName')
    async addTag(@Param('tagName') tagName){
        const tag = await this.blogService.addTag(tagName);
        if(tag) return tag;
        throw new HttpException('Tag Not added',HttpStatus.NOT_MODIFIED);
    }

    @Patch(':articleId/tag/:tagId')
    async tagArticle(@Param('articleId') articleId: number, @Param('tagId') tagId:number){
        const article = await this.blogService.tagArticle(articleId,tagId);
        if(article) return article;
        throw new HttpException('Not Modified',HttpStatus.NOT_MODIFIED);
    }


}
