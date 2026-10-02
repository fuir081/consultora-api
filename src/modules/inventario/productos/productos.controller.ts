import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductosService } from './productos.service';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  create(@Body() body: any) {
    return this.productosService.create(body);
  }

  @Get()
  findAll(@Query('empresa_id') empresa_id: string) {
    return this.productosService.findAllByEmpresa(empresa_id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    // Aquí puedes implementar la lógica de actualización en tu service luego
    // return this.productosService.update(id, body);
    return { message: 'Ruta PUT lista para implementarse' };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // Aquí puedes implementar la lógica de eliminación en tu service luego
    // return this.productosService.remove(id);
    return { message: 'Ruta DELETE lista para implementarse' };
  }
}
