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

  // Método para crear un usuario y devolverlo sin la contraseña
  // Agrega currentUser: any como segundo parámetro
  async create(createUserDto: CreateUserDto, currentUser: any) {
    const emailExists = await this.usersRepository.findByEmail(
      createUserDto.email,
    );

    if (emailExists) {
      throw new BadRequestException('El correo ya está registrado.');
    }

    let { companyId, password, ...userData } = createUserDto;

    // REGLA DE NEGOCIO: Si el que crea es un ADMIN, le asignamos su misma empresa automáticamente
    if (currentUser.role === Role.ADMIN) {
      // Usamos el id del JWT (dependiendo de tu auth puede ser .id o .sub)
      const adminId = currentUser.id || currentUser.sub;
      const adminUser = await this.usersRepository.findByIdWithCompany(adminId);

      if (adminUser && adminUser.company) {
        companyId = adminUser.company.id; // Clonamos el ID de la empresa
      } else {
        throw new BadRequestException(
          'El administrador no tiene una empresa válida asignada.',
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      role: createUserDto.role || Role.USER,
    });

    if (companyId) {
      user.company = { id: companyId } as any;
    }

    const savedUser = await this.usersRepository.save(user);
    const { password: _, ...userWithoutPassword } = savedUser;

    return new ApiResponse(
      true,
      'Usuario creado correctamente.',
      userWithoutPassword,
    );
  }

  // Método para encontrar todos los usuarios y devolverlos sin la contraseña
  // Método para encontrar todos los usuarios filtrados por permisos
  // Método para encontrar todos los usuarios filtrados por permisos
  async findAll(currentUser: any) {
    let users = await this.usersRepository.findAll();

    // REGLA: Si el usuario es ADMIN, filtramos por su empresa real consultada a la BD
    if (currentUser.role === Role.ADMIN) {
      const adminId = currentUser.id || currentUser.sub;

      // Buscamos al admin actual en la BD para obtener su empresa real
      const adminUser = await this.usersRepository.findByIdWithCompany(adminId);
      const adminCompanyId = adminUser?.company?.id;

      users = users.filter(
        (user) =>
          user.company?.id === adminCompanyId && user.role !== Role.SYSADMIN,
      );
    }

    const result = users.map(({ password, ...user }) => user);

    return new ApiResponse(true, undefined, result);
  }

  // Método para encontrar un usuario por su id y devolverlo sin la contraseña
  async findOne(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const { password, ...userWithoutPassword } = user;

    return new ApiResponse(true, undefined, userWithoutPassword);
  }

  // Método para encontrar un usuario por su id
  async findEntityById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return user;
  }

  // Método para eliminar un usuario
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

  // Método para crear un usuario administrador
  async createAdmin(createAdminDto: CreateAdminDto) {
    const emailExists = await this.usersRepository.findByEmail(
      createAdminDto.email,
    );
    if (emailExists) {
      throw new BadRequestException('El correo ya está registrado.');
    }

    // Misma lógica: extraemos companyId
    const { companyId, password, ...adminData } = createAdminDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = this.usersRepository.create({
      ...adminData,
      password: hashedPassword,
      role: Role.ADMIN,
    });

    if (companyId) {
      admin.company = { id: companyId } as any;
    }

    const savedAdmin = await this.usersRepository.save(admin);

    const { password: _, ...adminWithoutPassword } = savedAdmin;

    return adminWithoutPassword;
  }

  // Método para actualizar el rol de un usuario
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

  // Método para actualizar el estado de un usuario
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
