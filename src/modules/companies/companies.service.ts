import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  async create(data: Partial<Company>): Promise<Company> {
    const newCompany = this.companyRepository.create(data);
    return this.companyRepository.save(newCompany);
  }

  async update(id: string, data: Partial<Company>): Promise<Company> {
    await this.companyRepository.update(id, data);
    const updatedCompany = await this.companyRepository.findOneBy({ id });
    if (!updatedCompany) {
      throw new NotFoundException('Empresa no encontrada');
    }
    return updatedCompany;
  }

  async remove(id: string): Promise<void> {
    await this.companyRepository.delete(id);
  }
}
