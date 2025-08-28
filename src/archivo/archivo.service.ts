import { Injectable } from '@nestjs/common';
import { CreateArchivoDto } from './dto/create-archivo.dto';
import { UpdateArchivoDto } from './dto/update-archivo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Archivo } from './entities/archivo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ArchivoService {
    constructor(
        @InjectRepository(Archivo)
        private archivoRepository: Repository<Archivo>,
    ) {}

    create(createArchivoDto: CreateArchivoDto) {
        return 'This action adds a new archivo';
    }

    findAll() {
        return `This action returns all archivo`;
    }

    async findOne(id: number) {
        return await this.archivoRepository.findOne({
            where: {
                id_bot_respuesta: id,
            },
        });
    }

    update(id: number, updateArchivoDto: UpdateArchivoDto) {
        return `This action updates a #${id} archivo`;
    }

    remove(id: number) {
        return this.archivoRepository
            .createQueryBuilder()
            .delete()
            .from(Archivo)
            .where('id_bot_respuesta = :id', { id })
            .execute();
    }
}
