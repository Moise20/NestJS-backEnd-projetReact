import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { ArticleEntity } from './entities/article.entity';
import { CommentEntity } from './entities/comment.entity';
import { TagEntity } from './entities/tag.entity';

@Module({
  imports:[TypeOrmModule.forFeature([ArticleEntity,CommentEntity,TagEntity])],
  controllers: [BlogController],
  providers: [BlogService]
})
export class BlogModule {}
