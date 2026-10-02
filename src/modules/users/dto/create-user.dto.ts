import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Role } from 'src/common/enums/role.enum'; // Ajusta la ruta si es necesario

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsString()
  rut!: string;

  @IsString()
  phone!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsUUID()
  @IsOptional()
  companyId?: string;
}
