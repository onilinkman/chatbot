import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistroAccionDto } from './create-registro_accion.dto';

export class UpdateRegistroAccionDto extends PartialType(CreateRegistroAccionDto) {}
