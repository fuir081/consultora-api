import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  Patch,
  Req,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../../common/enums/role.enum';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SYSADMIN, Role.ADMIN)
  @Get()
  findAll(@Req() req: any) {
    console.log('Todos los usuarios solicitados por:', req.user.email);
    // Pasamos el usuario logueado al servicio
    return this.usersService.findAll(req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SYSADMIN, Role.ADMIN) // <- Permitimos crear a ambos
  @Post()
  create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    console.log('Se ha creado un nuevo usuario por:', req.user.email);
    // Pasamos req.user (el creador) como segundo parámetro
    return this.usersService.create(createUserDto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SYSADMIN, Role.ADMIN)
  @Post('admin')
  createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.usersService.createAdmin(createAdminDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.usersService.updateRole(id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('Se ha encontrado un usuario con el id: ' + id);
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    console.log('Se ha eliminado un usuario con el id: ' + id);

    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SYSADMIN, Role.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.usersService.updateStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SYSADMIN, Role.ADMIN)
  @Delete(':id/permanent')
  removePermanent(@Param('id') id: string) {
    return this.usersService.removePermanent(id);
  }
}
