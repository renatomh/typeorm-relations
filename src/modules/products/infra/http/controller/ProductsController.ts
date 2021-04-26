import { Request, Response } from 'express';

import { container } from 'tsyringe';
import CreateProductService from '@modules/products/services/CreateProductService';

export default class ProductsController {
  public async create(request: Request, response: Response): Promise<Response> {
    // Pegando os dados do corpo da requisição
    const { name, price, quantity } = request.body;

    // Instanciando o serviço de criação de produtos
    const createProduct = container.resolve(CreateProductService);

    // Criando e retornando o produto
    const product = await createProduct.execute({ name, price, quantity });
    return response.json(product);
  }
}
