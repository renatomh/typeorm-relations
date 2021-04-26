import { Request, Response } from 'express';

import CreateCustomerService from '@modules/customers/services/CreateCustomerService';

import { container } from 'tsyringe';

export default class CustomersController {
  public async create(request: Request, response: Response): Promise<Response> {
    // Pegando os dados passados no corpo da requisição
    const { name, email } = request.body;

    // Injetando a dependência no serviço de criação de clientes e instanciando-o
    const createCustomer = container.resolve(CreateCustomerService);

    // Criando o cliente
    const customer = await createCustomer.execute({ name, email });

    // Retornando o resultado na resposta da requisição
    return response.json(customer);
  }
}
