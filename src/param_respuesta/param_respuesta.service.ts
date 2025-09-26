import { Injectable } from '@nestjs/common';
import { CreateParamRespuestaDto } from './dto/create-param_respuesta.dto';
import { UpdateParamRespuestaDto } from './dto/update-param_respuesta.dto';

@Injectable()
export class ParamRespuestaService {
  create(createParamRespuestaDto: CreateParamRespuestaDto) {
    return 'This action adds a new paramRespuesta';
  }

  findAll() {
    return `This action returns all paramRespuesta`;
  }

  findOne(id: number) {
    return `This action returns a #${id} paramRespuesta`;
  }

  update(id: number, updateParamRespuestaDto: UpdateParamRespuestaDto) {
    return `This action updates a #${id} paramRespuesta`;
  }

  remove(id: number) {
    return `This action removes a #${id} paramRespuesta`;
  }
}
