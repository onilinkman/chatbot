import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParamRespuestaService } from './param_respuesta.service';
import { CreateParamRespuestaDto } from './dto/create-param_respuesta.dto';
import { UpdateParamRespuestaDto } from './dto/update-param_respuesta.dto';

@Controller('param-respuesta')
export class ParamRespuestaController {
  constructor(private readonly paramRespuestaService: ParamRespuestaService) {}

  @Post()
  create(@Body() createParamRespuestaDto: CreateParamRespuestaDto) {
    return this.paramRespuestaService.create(createParamRespuestaDto);
  }

  @Get()
  findAll() {
    return this.paramRespuestaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paramRespuestaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParamRespuestaDto: UpdateParamRespuestaDto) {
    return this.paramRespuestaService.update(+id, updateParamRespuestaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paramRespuestaService.remove(+id);
  }
}
