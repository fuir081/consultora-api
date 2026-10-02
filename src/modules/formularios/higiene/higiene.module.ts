import { Module } from '@nestjs/common';
import { HigieneController } from './higiene.controller';
import { HigieneService } from './higiene.service';
// Ajusta la ruta si es necesario para importar tu MegaModule
import { MegaModule } from '../../../mega/mega.module';

@Module({
  imports: [MegaModule],
  controllers: [HigieneController],
  providers: [HigieneService],
})
export class HigieneModule {}
