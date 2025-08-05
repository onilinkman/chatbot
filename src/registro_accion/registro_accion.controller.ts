import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RegistroAccionService } from './registro_accion.service';
import { CreateRegistroAccionDto } from './dto/create-registro_accion.dto';
import { UpdateRegistroAccionDto } from './dto/update-registro_accion.dto';

@Controller('registro-accion')
export class RegistroAccionController {
  constructor(private readonly registroAccionService: RegistroAccionService) {}

  @Post()
  create(@Body() createRegistroAccionDto: CreateRegistroAccionDto) {
    return this.registroAccionService.create(createRegistroAccionDto);
  }

  @Get()
  findAll() {
    return this.registroAccionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registroAccionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegistroAccionDto: UpdateRegistroAccionDto) {
    return this.registroAccionService.update(+id, updateRegistroAccionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registroAccionService.remove(+id);
  }
}
