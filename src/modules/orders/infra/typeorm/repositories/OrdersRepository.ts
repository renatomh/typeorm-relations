import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = getRepository(Order);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    // As nossas entidades já estão relacionadas, então basta passar os objetos recebidos
    const order = this.ormRepository.create({
      customer,
      order_products: products,
    });
    await this.ormRepository.save(order);
    return order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    // Buscando o pedido e as informações relacionadas
    const order = this.ormRepository.findOne(id, {
      // Selecionando também os produtos do pedido e o cliente
      // Aqui funciona como o 'EagerLoading'
      relations: ['order_products', 'customer'],
    });
    return order;
  }
}

export default OrdersRepository;
