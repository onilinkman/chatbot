export class UpdateBotRespuestaDto {
    presentacion: string;
    mensaje: string;
    nro: number;
    codigo_accion: string;
    id_respuesta_origen: number | null;
    id_sesion_whatsapp: number;
}
