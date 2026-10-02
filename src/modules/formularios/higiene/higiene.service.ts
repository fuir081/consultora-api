import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { MegaService } from '../../../mega/mega.service';

@Injectable()
export class HigieneService {
  private readonly folderNodeId = process.env.HIGIENE_FOLDER_NODE_ID;
  private readonly fileName = 'REGISTRO HIGIENE PERSONAL.xlsx';

  constructor(private readonly megaService: MegaService) {}

  async updateExcelFile(evaluaciones: any[]) {
    if (!this.folderNodeId) {
      throw new InternalServerErrorException(
        'Falta HIGIENE_FOLDER_NODE_ID en el .env',
      );
    }

    try {
      const folderContents = await this.megaService.listFolder(
        this.folderNodeId,
      );
      const targetFile = folderContents.find(
        (file: any) => file.nombre === this.fileName,
      );

      if (!targetFile) {
        throw new NotFoundException(
          `No se encontró el archivo "${this.fileName}" en MEGA.`,
        );
      }

      const buffer = await this.megaService.getFileBuffer(targetFile.id);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);

      // Usamos la primera hoja disponible para evitar errores de ID interno
      const worksheet = workbook.worksheets[0];

      if (!worksheet) {
        throw new InternalServerErrorException(
          'No se encontró la hoja en el Excel.',
        );
      }

      // ==========================================
      // 1. ACTUALIZAR ENCABEZADOS (Fecha, Responsable, Semana)
      // ==========================================
      const fechaActual = new Date();
      const nombresMeses = [
        'ENERO',
        'FEBRERO',
        'MARZO',
        'ABRIL',
        'MAYO',
        'JUNIO',
        'JULIO',
        'AGOSTO',
        'SEPTIEMBRE',
        'OCTUBRE',
        'NOVIEMBRE',
        'DICIEMBRE',
      ];
      const mesAnio = `${nombresMeses[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;

      const celdaFecha = worksheet.getCell('AI3');
      if (celdaFecha) celdaFecha.value = mesAnio;

      if (evaluaciones.length > 0) {
        // CORRECCIÓN: Escribimos directamente en A7 y A8 para no borrar los criterios de evaluación de la columna B
        worksheet.getCell('A7').value =
          `Responsable: ${evaluaciones[0].responsable}`;
        worksheet.getCell('A8').value = `Semana: ${evaluaciones[0].semana}`;
      }

      // ==========================================
      // 2. IDENTIFICAR FILA DE INICIO
      // ==========================================
      let startRow = 10;
      for (let i = 1; i <= 20; i++) {
        const cellValue = worksheet
          .getCell(i, 1)
          .value?.toString()
          .trim()
          .toLowerCase();
        if (cellValue === 'nombre colaborador') {
          startRow = i + 1;
          break;
        }
      }

      const mapDias: Record<string, number> = {
        Lunes: 0,
        Martes: 1,
        Miércoles: 2,
        Jueves: 3,
        Viernes: 4,
        Sábado: 5,
        Domingo: 6,
      };

      const getMark = (status: string) => (status === 'cumple' ? '√' : 'x');

      // ==========================================
      // 3. PROCESAR CADA EVALUACIÓN
      // ==========================================
      evaluaciones.forEach((ev) => {
        const nombreColaborador = ev.colaborador.trim();
        const offsetDia = mapDias[ev.diaEvaluacion] ?? 0;

        let targetRowIndex = -1;
        let firstEmptyRowIndex = -1;

        for (let i = startRow; i <= startRow + 50; i++) {
          const cellValue = worksheet.getCell(i, 1).value?.toString().trim();

          if (cellValue === nombreColaborador) {
            targetRowIndex = i;
            break;
          }
          if (!cellValue && firstEmptyRowIndex === -1) {
            firstEmptyRowIndex = i;
          }
        }

        if (targetRowIndex === -1) {
          targetRowIndex =
            firstEmptyRowIndex !== -1
              ? firstEmptyRowIndex
              : worksheet.rowCount + 1;
        }

        const row = worksheet.getRow(targetRowIndex);

        row.getCell(1).value = nombreColaborador;
        row.getCell(2 + offsetDia).value = getMark(ev.evaluaciones.uniforme);
        row.getCell(9 + offsetDia).value = getMark(ev.evaluaciones.pelo);
        row.getCell(16 + offsetDia).value = getMark(ev.evaluaciones.manos);
        row.getCell(23 + offsetDia).value = getMark(ev.evaluaciones.joyas);
        row.getCell(30 + offsetDia).value = getMark(ev.evaluaciones.maquillaje);
      });

      // ==========================================
      // 4. GUARDAR Y REEMPLAZAR EN MEGA
      // ==========================================
      const rawBuffer = await workbook.xlsx.writeBuffer();
      const newBuffer = Buffer.isBuffer(rawBuffer)
        ? rawBuffer
        : Buffer.from(rawBuffer as ArrayBuffer);

      const fileMock = {
        originalname: this.fileName,
        buffer: newBuffer,
        size: newBuffer.length,
      } as Express.Multer.File;

      await this.megaService.uploadFile(
        this.folderNodeId,
        fileMock,
        targetFile.id,
      );

      return true;
    } catch (error) {
      console.error('Error al actualizar el Excel en MEGA:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error procesando el archivo Excel',
      );
    }
  }
}
