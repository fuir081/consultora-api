import { Role } from 'src/common/enums/role.enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({
    unique: true,
    length: 12,
  })
  companyRut!: string;

  @Column({
    length: 200,
  })
  companyName!: string;

  @Column({
    length: 150,
  })
  representativeName!: string;

  @Index()
  @Column({
    length: 12,
  })
  representativeRut!: string;

  @Column({
    length: 20,
  })
  phone!: string;

  @Index()
  @Column({
    unique: true,
  })
  email!: string;

  @Column()
  password!: string;

  @Column({
    nullable: true,
  })
  megaNodeId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({
    default: true,
  })
  isActive!: boolean;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role!: Role;
}
