import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBotRespuestaDto } from './dto/create-bot_respuesta.dto';
import { UpdateBotRespuestaDto } from './dto/update-bot_respuesta.dto';
import { BotRespuestaRepository } from './bot_respuesta.repository';
import { BotRespuesta } from './entities/bot_respuesta.entity';
import { SesionWhatsapp } from 'src/sesion_whatsapp/entities/sesion_whatsapp.entity';
import { Archivo } from 'src/archivo/entities/archivo.entity';
import { ArchivoService } from 'src/archivo/archivo.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BotRespuestaService {
    constructor(
        private readonly botRespuestaRepository: BotRespuestaRepository,
        private archivoService: ArchivoService,
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

    async getFirstQuestionBySesion(id_sesion_whatsapp: number) {
        const sw = new SesionWhatsapp();
        sw.id_sesion_whatsapp = id_sesion_whatsapp;

        const rpo = new BotRespuesta();

        const br = await this.botRespuestaRepository
            .createQueryBuilder('br')
            .leftJoinAndSelect('br.respuestas', 'respuestas')
            .leftJoinAndSelect('br.respuesta_origen', 'ro')

            .innerJoinAndSelect(
                'br.sesionWhatsapp',
                'sw',
                'sw.id_sesion_whatsapp = :id_sesion_whatsapp',
                { id_sesion_whatsapp },
            )
            .where('br.id_respuesta_origen IS NULL')

            .getMany();
        return br;
    }

    async findOneByMessage(mensaje: string, nombre_sesion: string) {
        const br = await this.botRespuestaRepository
            .createQueryBuilder('br')
            .leftJoinAndSelect('br.respuestas', 'respuestas')
            .leftJoinAndSelect('br.sesionWhatsapp', 'sw')
            .where('br.mensaje = :mensaje', { mensaje })
            .andWhere('br.eliminado = 0')
            .andWhere('sw.nombre_sesion = :nombre_sesion', { nombre_sesion })
            .getOne();
        return br;
    }

    async findOne(id: number) {
        const br = await this.botRespuestaRepository.find({
            relations: [
                'respuestas',
                'respuesta_origen',
                'sesionWhatsapp',
                'archivo',
            ],
            where: { id_bot_respuesta: id },
        });
        return br;
    }

    async findOneByNro(nro: number, respuesta_origen: BotRespuesta) {
        const br = await this.botRespuestaRepository.findOne({
            relations: ['respuestas', 'archivo'],
            where: {
                nro,
                eliminado: 0,
                respuesta_origen,
            },
        });
        return br;
    }

    async update(id: number, updateBotRespuestaDto: UpdateBotRespuestaDto) {
        const oldbr = await this.botRespuestaRepository.findOne({
            relations: ['respuestas'],
            where: {
                id_bot_respuesta: id,
            },
        });
        if (!oldbr) return 'Error';

        oldbr.nro = updateBotRespuestaDto.nro;

        oldbr.mensaje = updateBotRespuestaDto.mensaje;
        oldbr.presentacion = updateBotRespuestaDto.presentacion;
        oldbr.codigo_accion = updateBotRespuestaDto.codigo_accion;

        const newBr = await this.botRespuestaRepository.save(oldbr);
        return newBr;
    }

    async deleteFile(id_bot_respuesta: number) {
        const archivo = await this.archivoService.findOne(id_bot_respuesta);
        if (!archivo) {
            throw new Error('No se encontro el archivo que desea eliminar');
        }
        try {
            const filepath = path.join('./public', archivo?.url);
            if (this.existFile(archivo?.url)) {
                await this.borrarArchivo(filepath);
            }
            await this.archivoService.remove(id_bot_respuesta);
        } catch (err) {
            throw err;
        }
    }

    existFile(ruta: string): boolean {
        const filepath = path.join('./public', ruta);
        return fs.existsSync(filepath);
    }

    async borrarArchivo(ruta: string): Promise<boolean> {
        try {
            await fs.promises.access(ruta);
            await fs.promises.unlink(ruta);
            return true;
        } catch (err) {
            throw new Error(err);
        }
    }

    async saveFile(id_bot_respuesta: number, file: Express.Multer.File) {
        const br = await this.botRespuestaRepository.findOne({
            where: {
                id_bot_respuesta,
            },
        });
        const archivo = new Archivo();
        if (!br) throw new Error('Error al guardar archivo');
        archivo.bot_respuesta = br;
        archivo.nombre_archivo = file.filename;
        archivo.tipo = file.mimetype;
        archivo.url = file.filename;
        br.archivo = archivo;
        return await this.botRespuestaRepository.save(br);
    }

    remove(id: number) {
        return `This action removes a #${id} botRespuesta`;
    }
}
