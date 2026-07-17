import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';

@Controller('/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Request() req) {
    return this.ordersService.createFromCart(req.user.id);
  }

  @Get()
  getMyOrders(@Request() req) {
    return this.ordersService.findAllByUser(req.user.id);
  }

  @Get(':orderId')
  getOrder(@Request() req, @Param('orderId', ParseIntPipe) orderId: number) {
    return this.ordersService.findOne(req.user.id, orderId);
  }
}
