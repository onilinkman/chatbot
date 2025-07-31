import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { Persona } from './entities/persona.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PersonaService {
    constructor(
        @InjectRepository(Persona)
        private readonly personaRepository: Repository<Persona>,
    ) {}

    async create(createPersonaDto: CreatePersonaDto) {
        try {
            if (createPersonaDto.auth) {
                const salt = bcrypt.genSaltSync(10);
                createPersonaDto.auth.password = bcrypt.hashSync(
                    createPersonaDto.auth.password,
                    salt,
                );
            }

            const persona = this.personaRepository.create(createPersonaDto);
            await this.personaRepository.save(persona);
            return persona;
        } catch (error) {
            const err = error as Error;
            throw new InternalServerErrorException('error:', err.message);
        }
    }

    findAll() {
        return this.personaRepository.find();
    }

    findOne(id: number) {
        return `This action returns a #${id} persona`;
    }

    update(id: number, updatePersonaDto: UpdatePersonaDto) {
        return `This action updates a #${id} persona`;
    }

    remove(id: number) {
        return `This action removes a #${id} persona`;
    }
}
