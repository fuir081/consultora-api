import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  controllers: [CompaniesController], // AGREGADO
  providers: [CompaniesService], // AGREGADO
  exports: [TypeOrmModule, CompaniesService],
})
export class CompaniesModule {}
