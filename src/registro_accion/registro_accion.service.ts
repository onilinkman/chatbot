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

@Injectable()
export class RegistroAccionService {
    constructor(
        private readonly registroAccionRepository: RegistroAccionRepository,
        @InjectRepository(Telefono)
        private readonly telefonoRepository: Repository<Telefono>,
        private botRespuestaService: BotRespuestaService,
    ) {}

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

            if (!ra) {
                const br = await this.botRespuestaService.findOneByMessage(
                    rtr.mensaje,
                );
                if (!br) {
                    dataModel.status = 404;
                    dataModel.body = 'No encontrado';
                    dataModel.message = 'No se pudo iniciarl la conversacion';
                    return dataModel;
                }
                let text = br.presentacion + '\n';

                br.respuestas.forEach((element) => {
                    text += element.nro + '. ' + element.mensaje + '\n';
                });
                const nra = new RegistroAccion();
                nra.bot_respuesta = br;
                nra.telefono = telefono;
                await this.registroAccionRepository.save(nra);
                dataModel.status = 201;
                dataModel.body = text;
                dataModel.message = 'Se inicio una conversacion';
            } else {
                if (isNaN(+rtr.mensaje)) {
                    dataModel.status = 404;
                    dataModel.body = '_Elija una opcion correcta_';
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
                let text = resp.presentacion + '\n';

                resp.respuestas.forEach((element) => {
                    text += element.nro + '. ' + element.mensaje + '\n';
                });
                const nra = new RegistroAccion();
                nra.bot_respuesta = resp;
                nra.telefono = telefono;
                await this.registroAccionRepository.save(nra);
                dataModel.status = 201;
                dataModel.body = text;
                dataModel.message = 'Continua la conversacion';
            }

            return dataModel;
        } catch (error) {
            const err = error as Error;
            throw new Error('Error al guardar registro: ' + err.message);
        }
    }

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
