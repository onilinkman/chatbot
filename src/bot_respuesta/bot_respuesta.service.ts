import { Injectable } from '@nestjs/common';
import { CreateBotRespuestaDto } from './dto/create-bot_respuesta.dto';
import { UpdateBotRespuestaDto } from './dto/update-bot_respuesta.dto';
import { BotRespuestaRepository } from './bot_respuesta.repository';
import { BotRespuesta } from './entities/bot_respuesta.entity';
import { SesionWhatsapp } from 'src/sesion_whatsapp/entities/sesion_whatsapp.entity';

@Injectable()
export class BotRespuestaService {
    constructor(
        private readonly botRespuestaRepository: BotRespuestaRepository,
    ) {}

    create(createBotRespuestaDto: CreateBotRespuestaDto) {
        const botRespuesta = new BotRespuesta();
        botRespuesta.presentacion = createBotRespuestaDto.presentacion;
        botRespuesta.mensaje = createBotRespuestaDto.mensaje;
        botRespuesta.nro = createBotRespuestaDto.nro;
        botRespuesta.codigo_accion = createBotRespuestaDto.codigo_accion;

        const sesion_whatsapp = new SesionWhatsapp();
        sesion_whatsapp.id_sesion_whatsapp =
            createBotRespuestaDto.id_sesion_whatsapp;
        const botRespuestaPadre = new BotRespuesta();
        botRespuestaPadre.id_bot_respuesta =
            createBotRespuestaDto.id_respuesta_origen;

        botRespuesta.respuesta_origen = botRespuestaPadre;
        botRespuesta.sesionWhatsapp = sesion_whatsapp;
        return this.botRespuestaRepository.save(botRespuesta);
    }

    findAll() {
        return `This action returns all botRespuesta`;
    }

    async findOneByMessage(mensaje: string) {
        const br = await this.botRespuestaRepository.findOne({
            relations: ['respuestas'],
            where: { mensaje, eliminado: 0 },
        });
        return br;
    }

    findOne(id: number) {
        return `This action find a #${id} botRespuesta`;
    }

    async findOneByNro(nro: number, respuesta_origen: BotRespuesta) {
        const br = await this.botRespuestaRepository.findOne({
            relations: ['respuestas'],
            where: {
                nro,
                eliminado: 0,
                respuesta_origen,
            },
        });
        return br;
    }

    update(id: number, updateBotRespuestaDto: UpdateBotRespuestaDto) {
        return `This action updates a #${id} botRespuesta`;
    }

    remove(id: number) {
        return `This action removes a #${id} botRespuesta`;
    }
}
