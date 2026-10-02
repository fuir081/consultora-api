export class UserResponseDto {
  id!: string;
  name!: string;
  rut!: string;
  phone!: string;
  email!: string;
  role!: string;
  isActive!: boolean;
  companyId?: string | null;
  companyName?: string | null;
  megaNodeId?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
