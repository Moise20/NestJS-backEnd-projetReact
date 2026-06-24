// [LEARN] OrdersService transforme un panier en commande (checkout).
// [LEARN] C'est l'opération la plus critique du site : elle doit être atomique
// [LEARN] (tout réussit ou tout échoue). En production on utiliserait une transaction DB.
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

    // [LEARN] On crée d'abord la commande vide, puis on y ajoute les lignes.
    // [LEARN] En production, tout ça serait dans une transaction (queryRunner)
    // [LEARN] pour garantir l'atomicité : si la création d'un OrderItem échoue,
    // [LEARN] la commande entière est annulée (rollback).
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

    // [LEARN] On vide le panier APRÈS avoir confirmé la commande.
    // [LEARN] Si clearCart échoue, la commande existe quand même — c'est acceptable.
    // [LEARN] Le contraire (commande échoue mais panier vidé) serait catastrophique.
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
