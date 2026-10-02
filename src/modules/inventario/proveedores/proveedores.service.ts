import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './entities/proveedor.entity';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private proveedoresRepository: Repository<Proveedor>,
  ) {}

  async create(proveedorData: any) {
    const proveedor = this.proveedoresRepository.create(proveedorData);
    return await this.proveedoresRepository.save(proveedor);
  }

  async findAllByEmpresa(empresa_id: string) {
    return await this.proveedoresRepository.find({ where: { empresa_id } });
  }
}
