import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ArticleDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  image?: string;

  // [LEARN] @Type(() => Number) est nécessaire car les données venant d'un FormData
  // [LEARN] sont toujours des strings. class-transformer les convertit en number
  // [LEARN] avant que class-validator ne les valide avec @IsNumber().
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock?: number;
}
