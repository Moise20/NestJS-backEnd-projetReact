// [LEARN] CartService gère tout le cycle de vie du panier.
// [LEARN] Chaque utilisateur a un panier "courant" (le dernier créé, non converti en commande).
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cart-item.entity';
import { ArticleEntity } from '../blog/entities/article.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,

    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,

    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  // [LEARN] findOrCreateCart : on récupère le panier actif de l'utilisateur,
  // [LEARN] ou on en crée un nouveau s'il n'en a pas.
  // [LEARN] Cette méthode est privée car elle sert d'utilitaire interne.
  private async findOrCreateCart(userId: number): Promise<CartEntity> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.article'],
      order: { createdAt: 'DESC' },
    });

    if (!cart) {
      cart = this.cartRepository.create({ user: { id: userId } as any });
      await this.cartRepository.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async getCart(userId: number): Promise<CartEntity> {
    return this.findOrCreateCart(userId);
  }

  async addItem(userId: number, articleId: number, quantity: number): Promise<CartEntity> {
    const article = await this.articleRepository.findOne({ where: { id: articleId } });
    if (!article) throw new NotFoundException('Article introuvable');

    if (article.stock < quantity) {
      throw new BadRequestException(
        `Stock insuffisant. Disponible : ${article.stock}`,
      );
    }

    const cart = await this.findOrCreateCart(userId);

    const existingItem = cart.items.find((i) => i.article.id === articleId);

    if (existingItem) {
      // [LEARN] Si l'article est déjà dans le panier, on incrémente la quantité
      // [LEARN] plutôt que d'ajouter une nouvelle ligne.
      existingItem.quantity += quantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cart,
        article,
        quantity,
      });
      await this.cartItemRepository.save(newItem);
    }

    return this.getCart(userId);
  }

  async updateItem(userId: number, itemId: number, quantity: number): Promise<CartEntity> {
    const cart = await this.findOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) throw new NotFoundException('Article non trouvé dans le panier');

    item.quantity = quantity;
    await this.cartItemRepository.save(item);

    return this.getCart(userId);
  }

  async removeItem(userId: number, itemId: number): Promise<CartEntity> {
    const cart = await this.findOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) throw new NotFoundException('Article non trouvé dans le panier');

    await this.cartItemRepository.remove(item);
    return this.getCart(userId);
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.findOrCreateCart(userId);
    await this.cartItemRepository.remove(cart.items);
    // [LEARN] On supprime aussi le cart pour qu'un nouveau soit créé à la prochaine
    // [LEARN] utilisation. C'est plus propre que de garder un cart vide.
    await this.cartRepository.remove(cart);
  }
}
