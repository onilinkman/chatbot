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
import { EjecutarAccionRespuesta, OpcionesBot } from './dto/tipos_auxiliares';
import { RegistrandoEndpointDto } from './dto/registrando-endpoint.dto';
import CacheEndpoint from './dto/cache-endpoint.dto';
import PostMethodUrlImage from './dto/PostMethodUrlImage.dto';

@Injectable()
export class RegistroAccionService {
    private mapOpcionesBot: Map<
        String,
        (text: string, telefono: Telefono) => Promise<OpcionesBot>
    > = new Map();
    mapEjecutarAccion: Map<
        string,
        (telefono: Telefono) => Promise<EjecutarAccionRespuesta>
    > = new Map();

    private mapParamsEndpoint: Map<string, CacheEndpoint> = new Map();

    constructor(
        private readonly registroAccionRepository: RegistroAccionRepository,
        @InjectRepository(Telefono)
        private readonly telefonoRepository: Repository<Telefono>,
        private botRespuestaService: BotRespuestaService,
    ) {
        this.mapOpcionesBot.set('/', this.mostrarAyuda);
        this.mapOpcionesBot.set('/ATRAS', this.volverUltimaAccion);
        this.mapOpcionesBot.set('/SALIR', this.salirDelBot);

        this.mapEjecutarAccion.set('eliminarChat', this.accionEliminarChat);
        this.mapEjecutarAccion.set(
            'volverUltimaAccion',
            this.accionVolverUltimoAccion,
        );
    }

    create(createRegistroAccionDto: CreateRegistroAccionDto) {
        return 'This action adds a new registroAccion';
    }

    findAll() {
        return `This action returns all registroAccion`;
    }

    async registroAccion(
        rtr: RespuestaTelefonoRegistroDto,
        nombreSesion: string,
    ): Promise<DataModelBot<string | PostMethodUrlImage>> {
        const dataModel: DataModelBot<string | PostMethodUrlImage> =
            new DataModelBot<string | PostMethodUrlImage>();
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

            let fn = await this.elegirOpcionBot(
                rtr.mensaje.trim().toUpperCase(),
                telefono,
            );

            if (fn.terminar) {
                dataModel.status = 201;
                dataModel.body = fn.msg;
                dataModel.message =
                    'Se mostro o ejecuto lo de las opciones del Bot';
                return dataModel;
            }

            if (this.mapParamsEndpoint?.get(rtr.nro_telefono)) {
                return this.obtenerEndpoint(
                    rtr.nro_telefono,
                    rtr.mensaje,
                    telefono,
                );
            }

            rtr.mensaje = rtr.mensaje.trim().toUpperCase();

            //
            const ra = await this.registroAccionRepository
                .createQueryBuilder('registro')
                .leftJoinAndSelect('registro.bot_respuesta', 'bot_respuesta')
                .leftJoinAndSelect('bot_respuesta.archivo', 'archivo')
                .leftJoinAndSelect('bot_respuesta.respuestas', 'respuestas')
                .leftJoin('bot_respuesta.endpoint', 'endpoint')
                .innerJoin(
                    'bot_respuesta.sesionWhatsapp',
                    'sw',
                    'sw.nombre_sesion = :nombreSesion',
                    { nombreSesion },
                )
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
                .cache(true)
                .getOne();

            if (!ra) {
                const br = await this.botRespuestaService.findOneByMessage(
                    rtr.mensaje,
                    nombreSesion,
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
            //aqui vemos si la respuesta tenia un endpoint

            //#####################################
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
                dataModel.message = 'No se pudo iniciar la conversacion';
                return dataModel;
            }

            if (resp.endpoint && resp.endpoint.parametros) {
                const cacheEndpoint = new CacheEndpoint();
                cacheEndpoint.endpoint = resp.endpoint;
                const newMap = new Map<string, RegistrandoEndpointDto>();
                const parametros = resp.endpoint.parametros;
                parametros.forEach((value) => {
                    const re = new RegistrandoEndpointDto();
                    re.parametro = value;
                    re.respuesta = null;
                    newMap.set(value.nombre, re);
                });
                cacheEndpoint.mapRegistroEndpoint = newMap;
                this.mapParamsEndpoint.set(
                    telefono.nro_telefono,
                    cacheEndpoint,
                );
                dataModel.body = parametros[0].descripcion;
                dataModel.status = 201;
                dataModel.message = 'Se esta armando el endpoint';
                return dataModel;
            }

            const archive = resp.archivo;

            if (archive) {
                dataModel.status = 222;
                dataModel.body = archive.url;
                dataModel.message = resp.mensaje;
                return dataModel;
            }

            if (resp.codigo_accion) {
                const terminar = await this.ejecutarAccion(
                    resp.codigo_accion,
                    telefono,
                );
                const lastRa = await this.getUltimaRespuesta(
                    telefono,
                    nombreSesion,
                );
                if (terminar.nro_accion == 2) {
                    dataModel.status = 409;
                    dataModel.body = 'Error al obtener el ultimo valor';
                    dataModel.message = 'Se corto el flujo';
                    if (!lastRa) return dataModel;
                    dataModel.status = 201;
                    dataModel.body = await this.armarTexto(
                        lastRa.bot_respuesta,
                    );
                    dataModel.message = 'Se corto el flujo';
                    return dataModel;
                }
                if (terminar.nro_accion == 1) {
                    dataModel.status = 409;
                    dataModel.body =
                        'Se salio del chat bot exitosamente, si quiere comenzar una nueva conversacion escribe la palabra clave';
                    dataModel.message = 'Se corto el flujo';
                    return dataModel;
                }
                dataModel.status = 201;
                dataModel.body = '';
                dataModel.message = 'Se corto el flujo';
                if (terminar.continuar) return dataModel;
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

    async getUltimaRespuesta(telefono: Telefono, nombreSesion: string) {
        return await this.registroAccionRepository
            .createQueryBuilder('registro')
            .leftJoinAndSelect('registro.bot_respuesta', 'bot_respuesta')
            .leftJoinAndSelect('bot_respuesta.respuestas', 'respuestas')
            .innerJoin(
                'bot_respuesta.sesionWhatsapp',
                'sw',
                'sw.nombre_sesion = :nombreSesion',
                { nombreSesion },
            )
            .leftJoin('bot_respuesta.endpoint', 'endpoint')
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
    }

    async obtenerEndpoint(
        nro_telefono: string,
        mensaje: string,
        telefono: Telefono,
    ): Promise<DataModelBot<string | PostMethodUrlImage>> {
        const m = this.mapParamsEndpoint.get(nro_telefono);
        const dataModel = new DataModelBot<string | PostMethodUrlImage>();
        if (m) {
            let sw = true;
            const arr = Array.from(m.mapRegistroEndpoint.values());
            for (let i = 0; i < arr.length; i++) {
                const value = arr[i];
                if (!value.respuesta && sw) {
                    value.respuesta = mensaje;
                    sw = false;
                    if (arr[i + 1]) {
                        dataModel.body = arr[i + 1].parametro.descripcion;
                        break;
                    } else {
                        sw = true;
                    }
                }
            }
            if (sw) {
                dataModel.body = 'aqui la imagen o qr';
                const postMethod = await this.armarBodyJson(nro_telefono);
                this.getLimpiarMapMemoriaTelefono(nro_telefono);

                if (!postMethod) {
                    dataModel.body = 'No se encontro qr';
                    dataModel.message = 'No se encontro qr';
                    dataModel.status = 404;
                    return dataModel;
                }
                dataModel.body = postMethod;
                dataModel.status = 223;
                dataModel.message = 'generado correctamente';

                return dataModel;
                //this.accionVolverUltimoAccion(telefono);
            }
        }
        dataModel.status = 201;
        dataModel.message = 'Se pregunto de nuevo';
        return dataModel;
    }

    armarBodyJson = async (nro_telefono: string) => {
        const cacheEndpoint = this.mapParamsEndpoint.get(nro_telefono);
        if (!cacheEndpoint) {
            return;
        }
        const url = cacheEndpoint.endpoint.url;
        const method = cacheEndpoint.endpoint.metodo;
        const atributos: { [key: string]: string | number } = {};
        cacheEndpoint.mapRegistroEndpoint.forEach((value) => {
            if (value.respuesta) {
                atributos[value.parametro.nombre] = value.respuesta;
            }
        });
        if (cacheEndpoint.endpoint.tipo === 'url_img') {
            try {
                const pago: PostMethodUrlImage = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(atributos),
                }).then((data) => data.json());
                return pago;
            } catch (error) {
                throw error;
            }
        }
    };

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
    ): Promise<EjecutarAccionRespuesta> {
        const mea = this.mapEjecutarAccion.get(codigoAccion);
        if (!mea) {
            return {
                continuar: true,
                nro_accion: 0,
            };
        }
        let ar = await mea(telefono);
        return ar;
    }

    accionEliminarChat = async (
        telefono: Telefono,
    ): Promise<EjecutarAccionRespuesta> => {
        const id_telefono = telefono.id_telefono;
        await this.registroAccionRepository
            .createQueryBuilder()
            .update()
            .set({ eliminado: 1 })
            .where('id_telefono = :id_telefono', { id_telefono })
            .execute();
        return {
            continuar: false,
            nro_accion: 1,
        };
    };

    accionVolverUltimoAccion = async (
        telefono: Telefono,
    ): Promise<EjecutarAccionRespuesta> => {
        await this.volverUltimaAccion('', telefono);
        return {
            continuar: true,
            nro_accion: 2,
        };
    };

    salirDelBot = async (text: string, telefono: Telefono) => {
        const id_telefono = telefono.id_telefono;
        await this.registroAccionRepository
            .createQueryBuilder()
            .update()
            .set({ eliminado: 1 })
            .where('id_telefono = :id_telefono', { id_telefono })
            .execute();
        return {
            terminar: true,
            msg: 'Se salio del chat',
        };
    };

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

    getMapEjecutarAcciones = () => {
        return this.mapEjecutarAccion;
    };

    getLimpiarMapMemoriaTelefono = (nro_telefono: string) => {
        this.mapParamsEndpoint.delete(nro_telefono);
    };
}
