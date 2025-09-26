import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { UpdateEndpointDto } from './dto/update-endpoint.dto';
import { Repository } from 'typeorm';
import { Endpoint } from './entities/endpoint.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BotRespuesta } from 'src/bot_respuesta/entities/bot_respuesta.entity';

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
            const botRespuesta: BotRespuesta = new BotRespuesta();
            botRespuesta.id_bot_respuesta = createEndpointDto.id_bot_respuesta;
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
