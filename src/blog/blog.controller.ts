import { BadRequestException, Body, Controller, Delete, Get, HttpException, HttpStatus, Logger, Param, Patch, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ArticleDto } from 'src/dtos/article.dto';
import { CommentDto } from 'src/dtos/comment.dto';
import { BlogService } from './blog.service';
import { diskStorage } from 'multer';
import path, { extname } from 'path';
import * as multer from 'multer';
import * as fs from 'fs';
import { Multer } from 'multer';

//import { Multer } from '@nestjs/platform-express';


//import multer, { File } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';


@Injectable()
@Controller('/blog')
export class BlogController {
    private readonly upload;

    constructor(private readonly blogService: BlogService) {

        this.upload = multer({
            storage: diskStorage({
                destination: './public/images',
                filename: function (req, file, cb) {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    const fileName = `${randomName}${extname(file.originalname)}`;
                    cb(null, fileName);
                }.bind(this),
            }),
            fileFilter: function (req, file, cb) {
                const allowedTypes = ['image/jpeg', 'image/png'];
                if (allowedTypes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new BadRequestException('Invalid file type'), false);
                }
            }.bind(this),
        });
    }

    @Get()
    async getAllArticles(@Query('limit') limit = 10, @Query('offset') offset = 0) {
        const articles = await this.blogService.getArticles(limit, offset);

        return articles.map(article => ({
            id: article.id,
            title: article.title,
            body: article.body,
            image: article.image,
            likes: article.likes,
            //image:  `public/images/${article.image}`, // assume that the images are stored in public/images directory
            //images: Array.isArray(article.image) ? article.image.map(imaged => `/images/${imaged.filename}`) : [], // assume that the images are stored in public/images directory

            date: article.createdAt,

        }));
    }
   

    @Get(':articleId')
    async getOne(@Param('articleId') articleId) {
        Logger.log('Get one article', 'BlogController');
        const article = await this.blogService.getOneArticle(articleId);
        if (article)
            return article;
        throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }


    @Post('article')
    @UseInterceptors(FileInterceptor('image'))
    async createArticleWithImage(@Body() articleDto: ArticleDto, @UploadedFile() file: Multer.File) {
        //console.log('File received:', file);
        if (!file.originalname) {
            //console.log('Original name not defined in the received file');
            return;
        }
        const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
        const fileName = `${randomName}${extname(file.originalname)}`;
        console.log(fileName);
        const filePath = `/images/${fileName}`;
        console.log(filePath);
        //const absoluteFilePath = path.join(process.cwd(), 'public', 'images', fileName);
        const absoluteFilePath = process.cwd() + '/public/images/' + fileName;
        //console.log('Generated file name:', fileName);
        await fs.promises.writeFile(absoluteFilePath, file.buffer);
        //console.log('File saved:', absoluteFilePath);
        const article = await this.blogService.createdArticle(articleDto, filePath);
        //console.log('Article created:', article);
        return article;
    }


    
    @Put(':articleId')
    @UseInterceptors(FileInterceptor('image'))
    async update(@Param('articleId') articleId, @UploadedFile() image, @Body() articleDto) {
        Logger.log('Update an article', 'BlogController');
        console.log(articleId);
        console.log(articleDto);

        if (image) {
            // Générer un identifiant unique pour l'image
            const imageId = uuidv4();

            // Stocker l'image sur le disque public
            const imagePath = `public/images/${imageId}.jpg`;
            fs.writeFileSync(imagePath, image.buffer);

            // Enregistrer les informations de l'image dans l'objet articleDto
            articleDto.image = imagePath;

            // Enregistrer les informations de l'article dans la base de données
            const article = await this.blogService.updateArticle(articleId, articleDto, imageId);

            if (article) {
                return article;
            }
        }

        throw new HttpException('Not modified', HttpStatus.NOT_MODIFIED);
    }




    @Delete(':articleId')
    async remove(@Param('articleId') articleId) {
        Logger.log('Update an article', 'BlogController');
        const article = await this.blogService.removeArticle(articleId);

        if (article) return article;
        throw new HttpException('Not Found', HttpStatus.NOT_MODIFIED);
    }

    @Post('comment/:articleId')
    async addComment(@Param('articleId') articleid, @Body() commentDto: CommentDto) {
        const comment = await this.blogService.addComment(articleid, commentDto);
        if (comment) return comment;
        throw new HttpException('Not modified', HttpStatus.NOT_MODIFIED);

    };

    @Get('comment/count/:articleId')
    async getCommentCount(@Param('articleId') articleId): Promise<number> {
        const count = await this.blogService.getCommentsCount(articleId);
        return count;
    }


    @Post('tag/:tagName')
    async addTag(@Param('tagName') tagName) {
        const tag = await this.blogService.addTag(tagName);
        if (tag) return tag;
        throw new HttpException('Tag Not added', HttpStatus.NOT_MODIFIED);
    }

    @Patch(':articleId/tag/:tagId')
    async tagArticle(@Param('articleId') articleId: number, @Param('tagId') tagId: number) {
        const article = await this.blogService.tagArticle(articleId, tagId);
        if (article) return article;
        throw new HttpException('Not Modified', HttpStatus.NOT_MODIFIED);
    }

    @Get(':articleId/tags')
    async getArticleTags(@Param('articleId') articleId) {
        Logger.log('Get article tags', 'BlogController');
        const tags = await this.blogService.getArticleTags(articleId);
        if (tags)
            return tags;
        throw new HttpException('Tags not found', HttpStatus.NOT_FOUND);
    }

    @Post(':articleId/like')
    async likeArticle(@Param('articleId') articleId: string) {
        const totalLikes = await this.blogService.incrementArticleLikes(articleId);
        if (!totalLikes) {
            throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
        }
        return { totalLikes };
    }

    @Get(':articleId/like')
    async getArticleLikes(@Param('articleId') articleId: string): Promise<{ likesParArticle: number }> {
        const likesParArticle = await this.blogService.getArticleLikes(articleId);
        if (likesParArticle === null) {
            throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
        }
        return { likesParArticle };
    }








}
