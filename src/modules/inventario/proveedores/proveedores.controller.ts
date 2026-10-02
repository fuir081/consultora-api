import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';

@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  create(@Body() body: any) {
    return this.proveedoresService.create(body);
  }

  @Get()
  findAll(@Query('empresa_id') empresa_id: string) {
    return this.proveedoresService.findAllByEmpresa(empresa_id);
  }
}
