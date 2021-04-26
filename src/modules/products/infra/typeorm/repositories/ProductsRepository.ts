import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = await this.ormRepository.create({
      name, price, quantity
    });

    await this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({
      where: {
        name,
      }
    })
    return product;
  }

  // Função para encontrar todos os produtos por ID
  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    // Pegando os IDs dos produtos
    const productIds = products.map(product => product.id);

    // Buscando os produtos no repositório cujo ID está na lista de IDs obtida
    const existingProducts = await this.ormRepository.find({
      where: {
        id: In(productIds),
      }
    })
    return existingProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    // Consideramos que já temos o objeto do produto com a quantidade atualizada
    return this.ormRepository.save(products);
  }
}

export default ProductsRepository;
