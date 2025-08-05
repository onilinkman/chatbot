import { PartialType } from '@nestjs/mapped-types';
import { CreateBotRespuestaDto } from './create-bot_respuesta.dto';

export class UpdateBotRespuestaDto extends PartialType(CreateBotRespuestaDto) {}
