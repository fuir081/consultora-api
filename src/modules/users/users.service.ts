import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './repositories/users.repository';
import { Role } from 'src/common/enums/role.enum';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ApiResponse } from 'src/common/responses/api-response';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  //Método para crear un usuario y devolverlo sin la contraseña
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
      role: Role.USER,
    });

    const savedUser = await this.usersRepository.save(user);

    const { password, ...userWithoutPassword } = savedUser;

    return new ApiResponse(
      true,
      'Usuario creado correctamente.',
      userWithoutPassword,
    );
  }
  //Método para encontrar todos los usuarios y devolverlos sin la contraseña
  async findAll() {
    const users = await this.usersRepository.findAll();

    const result = users.map(({ password, ...user }) => user);

    return new ApiResponse(true, undefined, result);
  }

  //Método para encontrar un usuario por su id y devolverlo sin la contraseña
  async findOne(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const { password, ...userWithoutPassword } = user;

    return new ApiResponse(true, undefined, userWithoutPassword);
  }
  //Método para encontrar un usuario por su id
  async findEntityById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return user;
  }
  //Método para eliminar un usuario
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

  //Método para crear un usuario administrador
  async createAdmin(createAdminDto: CreateAdminDto) {
    const emailExists = await this.usersRepository.findByEmail(
      createAdminDto.email,
    );
    if (emailExists) {
      throw new BadRequestException('El correo ya está registrado.');
    }
    const companyExists = await this.usersRepository.findByCompanyRut(
      createAdminDto.companyRut,
    );

    if (companyExists) {
      throw new BadRequestException('El RUT de la empresa ya existe.');
    }

    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

    const admin = this.usersRepository.create({
      ...createAdminDto,
      password: hashedPassword,
      role: Role.ADMIN,
    });

    const savedAdmin = await this.usersRepository.save(admin);

    const { password, ...adminWithoutPassword } = savedAdmin;

    return adminWithoutPassword;
  }

  //Método para actualizar el rol de un usuario
  async updateRole(id: string, dto: UpdateRoleDto) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    user.role = dto.role;

    const saved = await this.usersRepository.save(user);

    const { password, ...result } = saved;

    return result;
  }

  //Método para actualizar el estado de un usuario
  async updateStatus(id: string, dto: UpdateStatusDto) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    user.isActive = dto.isActive;

    const saved = await this.usersRepository.save(user);

    const { password, ...result } = saved;

    return new ApiResponse(true, 'Estado actualizado correctamente.', result);
  }

  async removePermanent(id: string) {
    const exists = await this.usersRepository.existsById(id);

    if (!exists) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    await this.usersRepository.deleteById(id);

    return new ApiResponse(true, 'Usuario eliminado correctamente.');
  }
}
