import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ApiResponse } from 'src/common/responses/api-response';
import { UsersRepository } from '../users/repositories/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async login(loginDto: LoginDto) {
    console.log('--- 🔍 INTENTO DE LOGIN RECIBIDO ---');
    console.log('Correo ingresado:', loginDto.email);

    // 1. Buscamos al usuario con su contraseña
    const userWithPassword = await this.usersRepository.findByEmailWithPassword(
      loginDto.email,
    );

    if (!userWithPassword) {
      console.log('❌ FALLO: El correo no existe en la base de datos.');
      throw new UnauthorizedException('Credenciales inválidas');
    }

    console.log('✅ Usuario encontrado en BD:', userWithPassword.email);
    console.log('Estado isActive:', userWithPassword.isActive);

    if (!userWithPassword.isActive) {
      console.log('❌ FALLO: La cuenta está deshabilitada.');
      throw new UnauthorizedException('La cuenta se encuentra deshabilitada.');
    }

    const validPassword = await bcrypt.compare(
      loginDto.password,
      userWithPassword.password,
    );

    console.log(
      'Resultado de comparación de contraseña (bcrypt):',
      validPassword,
    );

    if (!validPassword) {
      console.log('❌ FALLO: La contraseña no coincide con el hash.');
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Cargamos la relación con la empresa
    const user = await this.usersRepository.findByIdWithCompany(
      userWithPassword.id,
    );
    console.log(
      '✅ Empresa asociada:',
      user?.company?.razonSocial || 'Ninguna (Es null)',
    );
    console.log(
      'MegaNodeId de la empresa:',
      user?.company?.megaNodeId || 'No tiene',
    );

    const payload = {
      sub: user?.id,
      email: user?.email,
      role: user?.role,
      companyId: user?.company?.id || null,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    console.log('--- 🎉 LOGIN EXITOSO ---');

    return new ApiResponse(true, 'Inicio de sesión exitoso.', {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: '15m',
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        role: user?.role,
        companyId: user?.company?.id || null,
        companyName: user?.company?.razonSocial || null,
        company: user?.company
          ? {
              id: user.company.id,
              rut: user.company.rut,
              razonSocial: user.company.razonSocial,
              megaNodeId: user.company.megaNodeId,
            }
          : null,
      },
    });
  }

  async validateUser(email: string, pass: string) {
    const user =
      await this.usersRepository.findByEmailWithPasswordAndCompany(email);

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
