import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MegaService } from './mega.service';
import type { Response } from 'express';
import 'multer';

@Controller('mega')
export class MegaController {
  constructor(private readonly megaService: MegaService) {}

  @Get('test')
  test() {
    return this.megaService.testConnection();
  }

  @Get('folders')
  listFolders() {
    return this.megaService.listRoot();
  }

  @Get('folders/:nodeId')
  listFolder(@Param('nodeId') nodeId: string) {
    return this.megaService.listFolder(nodeId);
  }

  @Get('download/:nodeId')
  async download(@Param('nodeId') nodeId: string, @Res() res: Response) {
    return this.megaService.downloadFile(nodeId, res);
  }

  // Obtener Buffer bruto del archivo para preprocesarlo en React/FortuneSheet
  @Get('file-buffer/:nodeId')
  async getBuffer(@Param('nodeId') nodeId: string, @Res() res: Response) {
    const buffer = await this.megaService.getFileBuffer(nodeId);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(buffer);
  }

  // Ruta para Subir o Actualizar un archivo
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('folderId') folderId: string,
    @Body('replaceNodeId') replaceNodeId?: string,
  ) {
    return this.megaService.uploadFile(folderId, file, replaceNodeId);
  }

  // Ruta para Eliminar un archivo/carpeta
  @Delete(':nodeId')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('nodeId') nodeId: string) {
    return this.megaService.deleteFile(nodeId);
  }
}
