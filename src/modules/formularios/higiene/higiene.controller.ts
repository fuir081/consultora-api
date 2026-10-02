import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { HigieneService } from './higiene.service';

@Controller('formularios/higiene')
export class HigieneController {
  constructor(private readonly higieneService: HigieneService) {}

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  async saveBatch(@Body('evaluaciones') evaluaciones: any[]) {
    await this.higieneService.updateExcelFile(evaluaciones);
    return { message: 'Registros guardados en MEGA correctamente' };
  }
}
