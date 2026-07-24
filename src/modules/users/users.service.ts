import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    const emailExists = await this.usersRepository.findByEmail(
      createUserDto.email,
    );

    if (emailExists) {
      throw new BadRequestException('El correo ya está registrado.');
    }

    const companyExists = await this.usersRepository.findByCompanyRut(
      createUserDto.companyRut,
    );

    if (companyExists) {
      throw new BadRequestException('El RUT de la empresa ya existe.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);

    const { password, ...userWithoutPassword } = savedUser;
    const users = await this.usersRepository.findAll();

    return users.map(({ password, ...user }) => user);
  }

  async findAll() {
    return this.usersRepository.findAll();
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
  async findEntityById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return user;
  }

  async remove(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return this.usersRepository.remove(user);
  }
  async findByEmail(email: string) {
    return this.usersRepository.findByEmailWithPassword(email);
  }
}
