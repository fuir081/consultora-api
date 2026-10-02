import {
  Injectable,
  Logger,
  OnModuleInit,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Mega from 'megajs';
import 'multer';

@Injectable()
export class MegaService implements OnModuleInit {
  private readonly logger = new Logger(MegaService.name);
  private connected = false;
  private storage!: Mega.Storage;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    const email = this.configService.getOrThrow<string>('MEGA_EMAIL');
    const password = this.configService.getOrThrow<string>('MEGA_PASSWORD');

    this.logger.log('Conectando con MEGA...');

    return new Promise<void>((resolve, reject) => {
      this.storage = new Mega.Storage({
        email,
        password,
        autoload: true,
      });

      this.storage.on('ready', () => {
        this.connected = true;
        this.logger.log('Conexión con MEGA establecida.');
        resolve();
      });

      (this.storage as any).on('error', (err: any) => {
        this.logger.error(err);
        reject(err);
      });
    });
  }

  private findNode(current: any, nodeId: string): any {
    // Comparamos tanto el nodeId como el handle 'h'
    if (current.nodeId === nodeId || current.h === nodeId) {
      return current;
    }

    if (!current.children) {
      return null;
    }

    for (const child of current.children) {
      const result = this.findNode(child, nodeId);
      if (result) {
        return result;
      }
    }

    return null;
  }
  // --- MÉTODOS EXISTENTES DE LECTURA ---

  async testConnection() {
    return { connected: this.connected };
  }

  async listRoot() {
    const root = (this.storage as any).root;
    return Object.values(root.children).map((item: any) => ({
      id: item.nodeId,
      handle: item.h,
      nombre: item.name,
      directory: item.directory,
      keys: Object.keys(item),
    }));
  }

  async listFolder(nodeId: string) {
    if (!this.connected) throw new Error('MEGA no está conectado.');
    const root = (this.storage as any).root;
    const folder = this.findNode(root, nodeId);

    if (!folder) throw new NotFoundException('Carpeta no encontrada.');

    return (folder.children || []).map((item: any) => ({
      id: item.nodeId,
      nombre: item.name,
      tipo: item.directory ? 'folder' : 'file',
      tamaño: item.size,
      fecha: item.timestamp,
    }));
  }

  async downloadFile(nodeId: string, res: any) {
    if (!this.connected) throw new Error('MEGA no está conectado.');
    const root = (this.storage as any).root;
    const file = this.findNode(root, nodeId);

    if (!file) throw new NotFoundException('Archivo no encontrado.');
    if (file.directory)
      throw new BadRequestException('El nodo corresponde a una carpeta.');

    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    const stream = file.download();
    stream.pipe(res);
  }

  // --- MÉTODOS: SUBIR, ELIMINAR Y OBTENER BUFFER ---

  /**
   * Obtiene un Buffer directamente en memoria (útil para que el frontend abra y lea el Excel)
   */
  async getFileBuffer(nodeId: string): Promise<Buffer> {
    if (!this.connected) throw new Error('MEGA no está conectado.');
    const root = (this.storage as any).root;
    const file = this.findNode(root, nodeId);

    if (!file || file.directory) {
      throw new NotFoundException('Archivo no encontrado.');
    }

    return new Promise((resolve, reject) => {
      file.download((err: any, data: Buffer) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  }

  /**
   * Sube un archivo a una carpeta específica de MEGA.
   * Si 'replaceNodeId' está presente, elimina el archivo anterior después de subir el nuevo.
   */
  async uploadFile(
    parentFolderId: string,
    file: Express.Multer.File,
    replaceNodeId?: string,
  ) {
    if (!this.connected) throw new Error('MEGA no está conectado.');
    const root = (this.storage as any).root;
    const folder = this.findNode(root, parentFolderId);

    if (!folder || !folder.directory) {
      throw new NotFoundException('Carpeta destino no encontrada.');
    }

    // Subida mediante megajs
    const uploadedFile = await new Promise<any>((resolve, reject) => {
      const uploadStream = folder.upload(
        {
          name: file.originalname,
          size: file.size,
        },
        (err: any, uploadedNode: any) => {
          if (err) return reject(err);
          resolve(uploadedNode);
        },
      );

      uploadStream.end(file.buffer);
    });

    // Si reemplazamos un archivo existente, borramos el nodo antiguo
    if (replaceNodeId) {
      try {
        await this.deleteFile(replaceNodeId);
      } catch (err) {
        this.logger.warn(
          `No se pudo eliminar el archivo antiguo (${replaceNodeId}) al reemplazar:`,
          err,
        );
      }
    }

    return {
      id: uploadedFile.nodeId,
      nombre: uploadedFile.name,
      tipo: 'file',
      tamaño: uploadedFile.size,
      fecha: uploadedFile.timestamp,
    };
  }

  /**
   * Elimina un archivo o carpeta en MEGA usando su nodeId
   */
  async deleteFile(nodeId: string) {
    if (!this.connected) throw new Error('MEGA no está conectado.');
    const root = (this.storage as any).root;
    const targetNode = this.findNode(root, nodeId);

    if (!targetNode) {
      throw new NotFoundException('El archivo/carpeta especificado no existe.');
    }

    return new Promise<{ success: boolean }>((resolve, reject) => {
      targetNode.delete((err: any) => {
        if (err) return reject(err);
        resolve({ success: true });
      });
    });
  }
}
