import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { UpdateEndpointDto } from './dto/update-endpoint.dto';
import { Repository } from 'typeorm';
import { Endpoint } from './entities/endpoint.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BotRespuesta } from 'src/bot_respuesta/entities/bot_respuesta.entity';
import { Parametro } from 'src/parametro/entities/parametro.entity';

@Injectable()
export class EndpointService {
    constructor(
        @InjectRepository(Endpoint)
        private readonly endpointRepository: Repository<Endpoint>,
    ) {}

    async create(createEndpointDto: CreateEndpointDto) {
        try {
            const dto = {
                ...createEndpointDto,
                parametros:
                    createEndpointDto.parametros === null
                        ? undefined
                        : createEndpointDto.parametros,
            };
            const endpoint: Endpoint = this.endpointRepository.create(dto);
            endpoint.parametros = [];
            const botRespuesta: BotRespuesta = new BotRespuesta();
            botRespuesta.id_bot_respuesta = createEndpointDto.id_bot_respuesta;
            dto.parametros?.forEach((value) => {
                const param_respuesta = new Parametro();
                param_respuesta.nombre = value.nombre;
                param_respuesta.descripcion = value.descripcion;
                param_respuesta.tipo = value.tipo;
                endpoint.parametros.push(param_respuesta);
            });
            endpoint.bot_respuesta = botRespuesta;
            await this.endpointRepository.save(endpoint);
            return endpoint;
        } catch (error) {
            const err = error as Error;
            throw new InternalServerErrorException('error:', err.message);
        }
    }

    findAll() {
        return `This action returns all endpoint`;
    }

    findOne(id: number) {
        return `This action returns a #${id} endpoint`;
    }

    update(id: number, updateEndpointDto: UpdateEndpointDto) {
        return `This action updates a #${id} endpoint`;
    }

    remove(id: number) {
        return `This action removes a #${id} endpoint`;
    }
}
