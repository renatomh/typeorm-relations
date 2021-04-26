import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) { }

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // Verificando se o cliente existe
    const customerExists = await this.customersRepository.findById(customer_id);

    // Caso não existe
    if (!customerExists) {
      throw new AppError('Could not find any customer with the given id');
    }

    // Verificando se os produtos existem
    const existingProducts = await this.productsRepository.findAllById(products);

    // Caso nenhum seja encontrado
    if (!existingProducts.length) {
      throw new AppError('Could not find any products with the given ids');
    }

    // Verificando os produtos com IDs existentes
    const existingProductsIds = existingProducts.map(product => product.id);
    const checkInexistentProducts = products.filter(product =>
      !existingProductsIds.includes(product.id),
    );

    // Caso haja produtos não cadastrados sendo passados na requisição
    if (checkInexistentProducts.length) {
      throw new AppError(`Could not find product ${checkInexistentProducts[0].id}`);
    }

    // Verificando se as quantidades disponíveis são suficientes para o pedido
    const findProductsWithNoQuantityAvailable = products.filter(product =>
      existingProducts.filter(p => p.id == product.id)[0].quantity <
      product.quantity,
    );

    // Se houver produtos com quantidade insuficente
    if (findProductsWithNoQuantityAvailable.length) {
      throw new AppError(`The quantity ${findProductsWithNoQuantityAvailable[0].quantity} is not available for ${findProductsWithNoQuantityAvailable[0].id}`);
    }

    // Formatando os registros para salvar no banco de dados
    const serializedProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: existingProducts.filter(p => p.id == product.id)[0].price,
    }));

    // Criando o pedido a ser salvo no banco de dados
    const order = await this.ordersRepository.create({
      customer: customerExists,
      products: serializedProducts,
    })

    // Pegando os produtos da ordem criada
    const { order_products } = order;

    // Reduzindo a quantidade de produtos disponíveis
    const orderedProductsQuantity = order_products.map(product => ({
      id: product.product_id,
      // Definindo a nova quantidade do produto
      quantity:
        existingProducts.filter(p => p.id == product.product_id)[0].quantity -
        product.quantity,
    }));
    await this.productsRepository.updateQuantity(orderedProductsQuantity);

    // Retornando o pedido criado
    return order;
  }
}

export default CreateOrderService;
