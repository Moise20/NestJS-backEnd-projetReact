import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,

    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,

    private readonly cartService: CartService,
  ) {}

  async createFromCart(userId: number): Promise<OrderEntity> {
    const cart = await this.cartService.getCart(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Le panier est vide');
    }

    const order = this.orderRepository.create({
      user: { id: userId } as any,
      totalAmount: 0,
    });
    const savedOrder = await this.orderRepository.save(order);

    let total = 0;
    const orderItems: OrderItemEntity[] = [];

    for (const cartItem of cart.items) {
      const unitPrice = Number(cartItem.article.price);
      const subtotal = unitPrice * cartItem.quantity;
      total += subtotal;

      const orderItem = this.orderItemRepository.create({
        order: savedOrder,
        articleId: cartItem.article.id,
        articleTitle: cartItem.article.title,
        articleImage: cartItem.article.image,
        unitPrice,
        quantity: cartItem.quantity,
        subtotal,
      });
      orderItems.push(orderItem);
    }

    await this.orderItemRepository.save(orderItems);

    savedOrder.totalAmount = total;
    await this.orderRepository.save(savedOrder);

    await this.cartService.clearCart(userId);

    return this.findOne(userId, savedOrder.id);
  }

  async findAllByUser(userId: number): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: number, orderId: number): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Commande introuvable');
    return order;
  }
}
