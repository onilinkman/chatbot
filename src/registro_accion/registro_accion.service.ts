import { Injectable } from '@nestjs/common';
import { CreateRegistroAccionDto } from './dto/create-registro_accion.dto';
import { UpdateRegistroAccionDto } from './dto/update-registro_accion.dto';
import { RegistroAccionRepository } from './registro_accion.repository';
import { MoreThan, Repository } from 'typeorm';
import { Telefono } from 'src/telefono/entities/telefono.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RespuestaTelefonoRegistroDto } from './dto/respuesta-telefono-registro.dto';
import { BotRespuestaService } from 'src/bot_respuesta/bot_respuesta.service';
import DataModelBot from './dto/data-model_bot.dto';
import { RegistroAccion } from './entities/registro_accion.entity';
import { BotRespuesta } from 'src/bot_respuesta/entities/bot_respuesta.entity';
import { OpcionesBot } from './dto/tipos_auxiliares';

@Injectable()
export class RegistroAccionService {
    private mapOpcionesBot: Map<
        String,
        (text: string, telefono: Telefono) => Promise<OpcionesBot>
    > = new Map();
    constructor(
        private readonly registroAccionRepository: RegistroAccionRepository,
        @InjectRepository(Telefono)
        private readonly telefonoRepository: Repository<Telefono>,
        private botRespuestaService: BotRespuestaService,
    ) {
        this.mapOpcionesBot.set('/', this.mostrarAyuda);
        this.mapOpcionesBot.set('/atras', this.volverUltimaAccion);
    }

    create(createRegistroAccionDto: CreateRegistroAccionDto) {
        return 'This action adds a new registroAccion';
    }

    findAll() {
        return `This action returns all registroAccion`;
    }

    async registroAccion(
        rtr: RespuestaTelefonoRegistroDto,
    ): Promise<DataModelBot<string>> {
        const dataModel: DataModelBot<string> = new DataModelBot<string>();
        try {
            let telefono = await this.telefonoRepository.findOne({
                where: {
                    nro_telefono: rtr.nro_telefono,
                },
            });
            if (!telefono) {
                const t = new Telefono();
                t.codigo_region = rtr.codigo_region;
                t.nro_telefono = rtr.nro_telefono;
                telefono = await this.telefonoRepository.save(t);
            }

            let fn = await this.elegirOpcionBot(rtr.mensaje, telefono);

            if (fn.terminar) {
                dataModel.status = 201;
                dataModel.body = fn.msg;
                dataModel.message =
                    'Se mostro o ejecuto lo de las opciones del Bot';
                return dataModel;
            }

            const ra = await this.registroAccionRepository
                .createQueryBuilder('registro')
                .leftJoinAndSelect('registro.bot_respuesta', 'bot_respuesta')
                .leftJoinAndSelect('bot_respuesta.respuestas', 'respuestas')
                .innerJoinAndSelect(
                    'registro.telefono',
                    't',
                    't.id_telefono = :id_telefono',
                    {
                        id_telefono: telefono.id_telefono,
                    },
                )
                .where('registro.eliminado=0')
                .orderBy('registro.id_registro_accion', 'DESC')
                .addOrderBy('respuestas.nro', 'ASC')
                .getOne();

            if (!ra) {
                const br = await this.botRespuestaService.findOneByMessage(
                    rtr.mensaje,
                );
                if (!br) {
                    dataModel.status = 404;
                    dataModel.body =
                        'Ingrese palabra clave para iniciar chat con _bot_';
                    dataModel.message = 'No se pudo iniciar la conversacion';
                    return dataModel;
                }
                let text = await this.armarTexto(br);
                const nra = new RegistroAccion();
                nra.bot_respuesta = br;
                nra.telefono = telefono;
                await this.registroAccionRepository.save(nra);
                dataModel.status = 201;
                dataModel.body = text;
                dataModel.message = 'Se inicio una conversacion';
                return dataModel;
            }
            if (isNaN(+rtr.mensaje)) {
                dataModel.status = 404;
                let t = await this.armarTexto(ra.bot_respuesta);
                dataModel.body = '_Elija una opcion correcta_\n' + t;
                dataModel.message = 'No es numero';
                return dataModel;
            }
            const resp = await this.botRespuestaService.findOneByNro(
                +rtr.mensaje,
                ra.bot_respuesta,
            );
            if (!resp) {
                dataModel.status = 404;
                dataModel.body = 'No encontrado';
                dataModel.message = 'No se pudo iniciarl la conversacion';
                return dataModel;
            }

            if (resp.codigo_accion) {
                const terminar = await this.ejecutarAccion(
                    resp.codigo_accion,
                    telefono,
                );
                dataModel.status = 201;
                dataModel.body = '';
                dataModel.message = 'Se corto el flujo';
                if (terminar) return dataModel;
            }

            let text = await this.armarTexto(resp);
            const nra = new RegistroAccion();
            nra.bot_respuesta = resp;
            nra.telefono = telefono;
            await this.registroAccionRepository.save(nra);

            dataModel.status = 201;
            dataModel.body = text;
            dataModel.message = 'Continua la conversacion';

            return dataModel;
        } catch (error) {
            const err = error as Error;
            throw new Error('Error al guardar registro: ' + err.message);
        }
    }

    async armarTexto(br: BotRespuesta): Promise<string> {
        let text = br.presentacion + '\n';
        if (!br.respuestas) return '';

        br.respuestas.forEach((element) => {
            text += element.nro + '. ' + element.mensaje + '\n';
        });
        return text;
    }

    async elegirOpcionBot(
        text: string,
        telefono: Telefono,
    ): Promise<OpcionesBot> {
        let opcionesBotMsg: OpcionesBot = {
            terminar: false,
            msg: '',
        };

        const fn = this.mapOpcionesBot.get(text);

        if (!fn) return opcionesBotMsg;

        return fn(text, telefono);
    }

    mostrarAyuda = async (
        text: string,
        telefono: Telefono,
    ): Promise<OpcionesBot> => {
        let msg = '';
        let a = [...this.mapOpcionesBot.keys()];
        a.forEach((value) => {
            msg += value + '\n';
        });
        return {
            terminar: true,
            msg,
        };
    };

    async ejecutarAccion(
        codigoAccion: string,
        telefono: Telefono,
    ): Promise<boolean> {
        if ('eliminarChat' == codigoAccion) {
            const id_telefono = telefono.id_telefono;
            await this.registroAccionRepository
                .createQueryBuilder()
                .update()
                .set({ eliminado: 1 })
                .where('id_telefono = :id_telefono', { id_telefono })
                .execute();
            return false;
        }
        if ('volverUltimaAccion' == codigoAccion) {
            await this.volverUltimaAccion('', telefono);
            return true;
        }
        return false;
    }

    volverUltimaAccion = async (text: string, telefono: Telefono) => {
        const ra = await this.registroAccionRepository.findOne({
            relations: ['bot_respuesta'],
            where: {
                telefono: telefono,
                eliminado: 0,
            },
            order: {
                id_registro_accion: 'DESC',
            },
        });
        if (ra) {
            await this.registroAccionRepository.update(
                { id_registro_accion: ra.id_registro_accion },
                { eliminado: 1 },
            );
            const ra2 = await this.registroAccionRepository
                .createQueryBuilder('registro')
                .leftJoinAndSelect('registro.bot_respuesta', 'bot_respuesta')
                .leftJoinAndSelect('bot_respuesta.respuestas', 'respuestas')
                .innerJoinAndSelect(
                    'registro.telefono',
                    't',
                    't.id_telefono = :id_telefono',
                    {
                        id_telefono: telefono.id_telefono,
                    },
                )
                .where('registro.eliminado=0')
                .orderBy('registro.id_registro_accion', 'DESC')
                .addOrderBy('respuestas.nro', 'ASC')
                .getOne();
            if (!ra2?.bot_respuesta)
                return {
                    terminar: true,
                    msg: 'No se pudo recuperar',
                };
            const text = await this.armarTexto(ra2.bot_respuesta);
            return {
                terminar: true,
                msg: text,
            };
        }
        return {
            terminar: true,
            msg: 'Se volvio hacia atras',
        };
    };

    findOne(id: number) {
        return `This action returns a #${id} registroAccion`;
    }

    update(id: number, updateRegistroAccionDto: UpdateRegistroAccionDto) {
        return `This action updates a #${id} registroAccion`;
    }

    remove(id: number) {
        return `This action removes a #${id} registroAccion`;
    }
}
