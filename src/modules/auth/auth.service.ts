import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ApiResponse } from 'src/common/responses/api-response';
import { DocumentToEntityTransformer } from 'typeorm/query-builder/transformer/DocumentToEntityTransformer.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    console.log(this.jwtService);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('La cuenta se encuentra deshabilitada.');
    }

    const validPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    return new ApiResponse(true, 'Inicio de sesión exitoso.', {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: '15m',
      user: {
        id: user.id,
        representativeName: user.representativeName,
        email: user.email,
        companyName: user.companyName,
        role: user.role,
      },
    });
  }
}
