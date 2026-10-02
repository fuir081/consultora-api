import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MegaController } from './mega.controller';
import { MegaService } from './mega.service';

@Module({
  imports: [ConfigModule],
  controllers: [MegaController],
  providers: [MegaService],
  exports: [MegaService],
})
export class MegaModule {}
