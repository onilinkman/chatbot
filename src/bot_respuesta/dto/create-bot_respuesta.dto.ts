import { BotRespuesta } from '../entities/bot_respuesta.entity';

export class CreateBotRespuestaDto {
    presentacion: string;
    mensaje: string;
    nro: number;
    codigo_accion: string;
    id_respuesta_origen: number;
    id_sesion_whatsapp: number;
}
