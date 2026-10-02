import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Proveedor } from '../../proveedores/entities/proveedor.entity';
import { ProductoReceta } from './producto-receta.entity';
export enum TipoProducto {
  FINAL = 'FINAL',
  INTERMEDIO = 'INTERMEDIO',
  MATERIA_PRIMA = 'MATERIA_PRIMA',
}

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nombre!: string;

  @Column({ nullable: true })
  codigo!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({ type: 'enum', enum: TipoProducto })
  tipo!: TipoProducto;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  stock!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  precio!: number;

  @Column()
  unidad_medida!: string;

  @Column()
  empresa_id!: string;

  // Relación con el Proveedor (Solo si es Materia Prima)
  @ManyToOne(() => Proveedor, (proveedor) => proveedor.productos, {
    nullable: true,
  })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor!: Proveedor;

  // Relación: Un producto puede estar compuesto de varios ingredientes
  @OneToMany(() => ProductoReceta, (receta) => receta.producto_padre, {
    cascade: true,
  })
  receta!: ProductoReceta[];
}
