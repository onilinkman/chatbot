import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateSesionWhatsappDto } from './dto/create-sesion_whatsapp.dto';
import { UpdateSesionWhatsappDto } from './dto/update-sesion_whatsapp.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SesionWhatsapp } from './entities/sesion_whatsapp.entity';

@Injectable()
export class SesionWhatsappService {
    constructor(
        @InjectRepository(SesionWhatsapp)
        private readonly personaRepository: Repository<SesionWhatsapp>,
    ) {}

    async create(createSesionWhatsappDto: CreateSesionWhatsappDto) {
        try {
            const sesion = this.personaRepository.create();
            await this.personaRepository.save(sesion);
            return sesion;
        } catch (error) {
            const err = error as Error;
            throw new InternalServerErrorException('error:', err.message);
        }
    }

    findAll() {
        return `This action returns all sesionWhatsapp`;
    }

    findOne(id: number) {
        return this.personaRepository.findOneBy({ id_sesion_whatsapp: id });
    }

    update(id: number, updateSesionWhatsappDto: UpdateSesionWhatsappDto) {
        return `This action updates a #${id} sesionWhatsapp`;
    }

    remove(id: number) {
        return `This action removes a #${id} sesionWhatsapp`;
    }
}
