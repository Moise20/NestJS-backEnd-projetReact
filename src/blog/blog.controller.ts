// [LEARN] Le BlogController gère les routes publiques (lecture des articles/produits)
// [LEARN] et les routes protégées (création, modification, suppression).
// [LEARN] Les routes d'écriture exigent d'être authentifié (JwtAuthGuard).
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ArticleDto } from '../dtos/article.dto';
import { CommentDto } from '../dtos/comment.dto';
import { BlogService } from './blog.service';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('/blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // [LEARN] Routes GET = publiques. N'importe qui peut consulter le catalogue.
  @Get()
  async getAllArticles(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ) {
    return this.blogService.getArticles(limit, offset);
  }

  @Get(':articleId')
  async getOne(@Param('articleId', ParseIntPipe) articleId: number) {
    const article = await this.blogService.getOneArticle(articleId);
    if (!article) throw new HttpException('Article introuvable', HttpStatus.NOT_FOUND);
    return article;
  }

  @Get(':articleId/tags')
  async getArticleTags(@Param('articleId', ParseIntPipe) articleId: number) {
    const tags = await this.blogService.getArticleTags(articleId);
    if (!tags) throw new HttpException('Tags introuvables', HttpStatus.NOT_FOUND);
    return tags;
  }

  @Get(':articleId/like')
  async getArticleLikes(@Param('articleId') articleId: string) {
    const likesParArticle = await this.blogService.getArticleLikes(articleId);
    if (likesParArticle === null) {
      throw new HttpException('Article introuvable', HttpStatus.NOT_FOUND);
    }
    return { likesParArticle };
  }

  @Get('comment/count/:articleId')
  async getCommentCount(@Param('articleId', ParseIntPipe) articleId: number) {
    return this.blogService.getCommentsCount(articleId);
  }

  // [LEARN] Routes POST/PUT/DELETE = protégées par JwtAuthGuard.
  // [LEARN] Sans token valide dans le header Authorization, NestJS renvoie 401.
  @Post('article')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createArticle(
    @Body() articleDto: ArticleDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Image requise');

    const imageUrl = await this.cloudinaryService.uploadImage(file);
    return this.blogService.createdArticle(articleDto, imageUrl);
  }

  @Put(':articleId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('articleId', ParseIntPipe) articleId: number,
    @UploadedFile() image: Express.Multer.File,
    @Body() articleDto: ArticleDto,
  ) {
    if (image) {
      articleDto.image = await this.cloudinaryService.uploadImage(image);
    }

    const article = await this.blogService.updateArticle(articleId, articleDto);
    if (!article) throw new HttpException('Non modifié', HttpStatus.NOT_MODIFIED);
    return article;
  }

  @Delete(':articleId')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('articleId', ParseIntPipe) articleId: number) {
    const article = await this.blogService.removeArticle(articleId);
    if (!article) throw new HttpException('Introuvable', HttpStatus.NOT_FOUND);
    return article;
  }

  @Post('comment/:articleId')
  async addComment(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Body() commentDto: CommentDto,
  ) {
    const comment = await this.blogService.addComment(articleId, commentDto);
    if (!comment) throw new HttpException('Non modifié', HttpStatus.NOT_MODIFIED);
    return comment;
  }

  @Post('tag/:tagName')
  @UseGuards(JwtAuthGuard)
  async addTag(@Param('tagName') tagName: string) {
    const tag = await this.blogService.addTag(tagName);
    if (!tag) throw new HttpException('Tag non ajouté', HttpStatus.NOT_MODIFIED);
    return tag;
  }

  @Patch(':articleId/tag/:tagId')
  @UseGuards(JwtAuthGuard)
  async tagArticle(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
  ) {
    const article = await this.blogService.tagArticle(articleId, tagId);
    if (!article) throw new HttpException('Non modifié', HttpStatus.NOT_MODIFIED);
    return article;
  }

  @Post(':articleId/like')
  async likeArticle(@Param('articleId') articleId: string) {
    const totalLikes = await this.blogService.incrementArticleLikes(articleId);
    if (!totalLikes) throw new HttpException('Article introuvable', HttpStatus.NOT_FOUND);
    return { totalLikes };
  }
}
