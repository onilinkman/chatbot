import { PartialType } from '@nestjs/mapped-types';
import { CreateParamRespuestaDto } from './create-param_respuesta.dto';

export class UpdateParamRespuestaDto extends PartialType(CreateParamRespuestaDto) {}
