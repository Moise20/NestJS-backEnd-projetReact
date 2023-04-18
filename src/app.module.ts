import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogModule } from './blog/blog.module';
import { ArticleEntity } from './blog/entities/article.entity';


@Module({
  imports: [BlogModule,TypeOrmModule.forRoot(
    {
      type: 'mysql',
      host: 'localhost',
      port: 3308,
      username: 'root',
      password: '',
      database: 'blog',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }
  )
   // TypeOrmModule.forRoot(require('ormconfig.json')),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {

  
}
