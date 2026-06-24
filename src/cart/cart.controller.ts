// [LEARN] Toutes les routes du panier sont protégées par @UseGuards(JwtAuthGuard).
// [LEARN] On ne peut pas consulter/modifier un panier sans être connecté.
// [LEARN] @Request() injecte l'objet req Express — req.user est peuplé par JwtStrategy.validate().
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { CartService } from './cart.service';

@Controller('/cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  addItem(@Request() req, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(req.user.id, dto.articleId, dto.quantity);
  }

  // [LEARN] ParseIntPipe convertit automatiquement le paramètre de route (string)
  // [LEARN] en number et renvoie une 400 si ce n'est pas un entier valide.
  @Patch('items/:itemId')
  updateItem(
    @Request() req,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(req.user.id, itemId, dto.quantity);
  }

  @Delete('items/:itemId')
  removeItem(@Request() req, @Param('itemId', ParseIntPipe) itemId: number) {
    return this.cartService.removeItem(req.user.id, itemId);
  }
}
