import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    // Pegando os dados dos parâmetros da requisição
    const { id } = request.params;

    // Istanciando o serviço já injetando a dependência
    const findOrder = container.resolve(FindOrderService);

    // Buscando o pedido
    const order = await findOrder.execute({ id });
    return response.json(order);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    // Pegando os dados do corpo da requisição
    const { customer_id, products } = request.body;

    // Istanciando o serviço já injetando a dependência
    const createOrder = container.resolve(CreateOrderService);

    // Criando e retornando o pedido
    const order = await createOrder.execute({
      customer_id,
      products
    });
    return response.json(order);
  }
}
