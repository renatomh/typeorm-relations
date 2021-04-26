import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    // Injetando a dependência para o repositório de clientes
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository
  ) { }

  public async execute({ name, email }: IRequest): Promise<Customer> {
    // Verificando se já há um cliente com o e-mail cadastrado
    const customerExists = await this.customersRepository.findByEmail(email);

    // Caso já existe
    if (customerExists) {
      throw new AppError('This e-mail is already assigned to a customer');
    }

    // Caso contrário, criamos um novo cliente e retornamos
    const customer = await this.customersRepository.create({ name, email });
    return customer;
  }
}

export default CreateCustomerService;
