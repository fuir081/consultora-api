export class AuthUserDto {
  id!: string;
  email!: string;
  companyName!: string;
  role!: string;
}

export class AuthResponseDto {
  accessToken!: string;
  tokenType!: string;
  expiresIn!: string;
  user!: AuthUserDto;
}
