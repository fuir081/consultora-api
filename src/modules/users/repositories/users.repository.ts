import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  create(data: Partial<User>) {
    return this.repository.create(data);
  }

  save(user: User) {
    return this.repository.save(user);
  }

  findAll() {
    return this.repository.find();
  }

  findById(id: string) {
    return this.repository.findOne({
      where: { id },
    });
  }

  findByEmail(email: string) {
    return this.repository.findOne({
      where: { email },
    });
  }

  findByCompanyRut(companyRut: string) {
    return this.repository.findOne({
      where: { companyRut },
    });
  }
  findByEmailWithPassword(email: string) {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  remove(user: User) {
    return this.repository.remove(user);
  }

  deleteById(id: string) {
    return this.repository.delete(id);
  }

  existsById(id: string) {
    return this.repository.exists({
      where: { id },
    });
  }
}
