import { Role } from 'src/common/enums/role.enum';
import { Company } from '../../companies/entities/company.entity'; // Asegúrate de ajustar esta ruta
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  name!: string;

  @Index()
  @Column({ length: 12 })
  rut!: string;

  @Column({ length: 20 })
  phone!: string;

  @Index()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role!: Role;

  // Nueva relación con Company
  @ManyToOne(() => Company, (company) => company.users, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
