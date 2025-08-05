import { Injectable } from '@nestjs/common';
import { CreateRegistroAccionDto } from './dto/create-registro_accion.dto';
import { UpdateRegistroAccionDto } from './dto/update-registro_accion.dto';

@Injectable()
export class RegistroAccionService {
  create(createRegistroAccionDto: CreateRegistroAccionDto) {
    return 'This action adds a new registroAccion';
  }

  findAll() {
    return `This action returns all registroAccion`;
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
