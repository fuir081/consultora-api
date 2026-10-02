export class AuthUserDto {
  id!: string;
  email!: string;
  name!: string; // Cambiado de representativeName
  companyId?: string | null; // Nuevo
  companyName?: string | null;
  role!: string;
}

export class AuthResponseDto {
  accessToken!: string;
  tokenType!: string;
  expiresIn!: string;
  user!: AuthUserDto;
}
