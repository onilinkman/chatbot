import { Module } from '@nestjs/common';
import { ParamRespuestaService } from './param_respuesta.service';
import { ParamRespuestaController } from './param_respuesta.controller';

@Module({
  controllers: [ParamRespuestaController],
  providers: [ParamRespuestaService],
})
export class ParamRespuestaModule {}
