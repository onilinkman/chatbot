import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Res,
} from '@nestjs/common';
import { RegistroAccionService } from './registro_accion.service';
import { CreateRegistroAccionDto } from './dto/create-registro_accion.dto';
import { UpdateRegistroAccionDto } from './dto/update-registro_accion.dto';
import { RespuestaTelefonoRegistroDto } from './dto/respuesta-telefono-registro.dto';
import { Response } from 'express';
import { ApiResponse } from 'src/models';
import { Telefono } from 'src/telefono/entities/telefono.entity';
import { EjecutarAccionRespuesta } from './dto/tipos_auxiliares';

@Controller('api/registro-accion')
export class RegistroAccionController {
    constructor(
        private readonly registroAccionService: RegistroAccionService,
    ) {}

    @Post()
    create(@Body() createRegistroAccionDto: CreateRegistroAccionDto) {
        return this.registroAccionService.create(createRegistroAccionDto);
    }

    @Get()
    findAll() {
        return this.registroAccionService.findAll();
    }

    @Post('buscarRegistroAccion')
    buscarRegistroAccion(@Body() rtr: RespuestaTelefonoRegistroDto) {
        return this.registroAccionService.registroAccion(rtr);
    }

    @Get('acciones')
    getAcciones(@Res() res: Response) {
        const apiResponse = new ApiResponse<String[]>();
        const mea = this.registroAccionService.getMapEjecutarAcciones();
        let acciones: String[] = [...mea.keys()];
        apiResponse.body = acciones;
        apiResponse.status = 200;
        apiResponse.mensaje = 'Se obtuvo la lista de acciones correctamente';
        return res.status(apiResponse.status).send(apiResponse);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.registroAccionService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateRegistroAccionDto: UpdateRegistroAccionDto,
    ) {
        return this.registroAccionService.update(+id, updateRegistroAccionDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.registroAccionService.remove(+id);
    }
}
