import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cart-item.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ArticleEntity } from '../blog/entities/article.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity, CartItemEntity, ArticleEntity])],
  controllers: [CartController],
  providers: [CartService],
  // [LEARN] On exporte CartService pour qu'OrdersModule puisse vider le panier
  // [LEARN] après une commande (clearCart).
  exports: [CartService],
})
export class CartModule {}
