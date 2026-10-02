import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { ProductoReceta } from './entities/producto-receta.entity';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, ProductoReceta])],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}
