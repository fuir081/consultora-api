import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { ProductoReceta } from './entities/producto-receta.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
    @InjectRepository(ProductoReceta)
    private recetasRepository: Repository<ProductoReceta>,
  ) {}

  async create(data: any) {
    // 1. Extraemos 'id' para evitar que NestJS intente guardar "" como UUID
    // 2. Extraemos receta y proveedor_id como lo hacíamos antes
    const { receta, proveedor_id, id, ...productoData } = data;

    // 3. Limpiamos los datos base asegurando los tipos correctos
    const nuevoProducto = this.productosRepository.create({
      ...productoData,
      precio: productoData.precio ? Number(productoData.precio) : 0,
      stock: productoData.stock ? Number(productoData.stock) : 0,
      proveedor: proveedor_id ? { id: proveedor_id } : null,
    } as DeepPartial<Producto>);

    const productoGuardado = await this.productosRepository.save(nuevoProducto);

    // Si es Intermedio o Final y trae receta, guardamos los ingredientes
    if (receta && receta.length > 0) {
      const ingredientes = receta.map((ing: any) => {
        return this.recetasRepository.create({
          producto_padre: { id: productoGuardado.id },
          producto_hijo: { id: ing.id_producto },
          cantidad: Number(ing.cantidad), // Aseguramos que la cantidad sea numérica
        });
      });
      await this.recetasRepository.save(ingredientes);
    }

    return productoGuardado;
  }

  async findAllByEmpresa(empresa_id: string) {
    return await this.productosRepository.find({
      where: { empresa_id },
      relations: {
        proveedor: true,
        receta: {
          producto_hijo: true,
        },
      },
    });
  }
}
