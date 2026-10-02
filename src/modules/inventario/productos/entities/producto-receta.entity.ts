import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Producto } from './producto.entity';

@Entity('productos_recetas')
export class ProductoReceta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('decimal', { precision: 10, scale: 4 })
  cantidad!: number;

  @ManyToOne(() => Producto, (producto) => producto.receta, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'producto_padre_id' })
  producto_padre!: Producto;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_hijo_id' })
  producto_hijo!: Producto;
}
