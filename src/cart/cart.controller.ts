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
