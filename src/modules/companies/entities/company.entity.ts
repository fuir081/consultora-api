import { Role } from 'src/common/enums/role.enum';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true, length: 12 }) rut!: string;
  @Column({ length: 200 }) razonSocial!: string;
  @Column({ nullable: true }) megaNodeId!: string;
  @OneToMany(() => User, (user) => user.company) users!: User[];
}
