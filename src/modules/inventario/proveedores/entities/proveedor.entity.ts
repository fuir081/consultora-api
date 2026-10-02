import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('proveedores')
export class Proveedor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nombre_empresa!: string;

  @Column()
  rut!: string;

  @Column({ nullable: true })
  telefono!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  direccion!: string;

  @Column()
  empresa_id!: string; // Para aislar datos por cliente (multi-tenant)

  @OneToMany(() => Producto, (producto) => producto.proveedor)
  productos!: Producto[];
}
