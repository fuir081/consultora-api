import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TestController } from './test.controller';
import { MegaModule } from './mega/mega.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { HigieneModule } from './modules/formularios/higiene/higiene.module';

// Nuevos Imports
import { ProveedoresModule } from './modules/inventario/proveedores/proveedores.module';
import { ProductosModule } from './modules/inventario/productos/productos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true, // Esto creará las tablas nuevas automáticamente
    }),

    UsersModule,
    AuthModule,
    HigieneModule,
    MegaModule,
    CompaniesModule,
    ProveedoresModule, // <-- Agregado
    ProductosModule, // <-- Agregado
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}
