import { Module } from '@nestjs/common';
import { RegistroAccionService } from './registro_accion.service';
import { RegistroAccionController } from './registro_accion.controller';

@Module({
  controllers: [RegistroAccionController],
  providers: [RegistroAccionService],
})
export class RegistroAccionModule {}
