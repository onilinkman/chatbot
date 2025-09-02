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
import { SesionWhatsappService } from './sesion_whatsapp.service';
import { CreateSesionWhatsappDto } from './dto/create-sesion_whatsapp.dto';
import { UpdateSesionWhatsappDto } from './dto/update-sesion_whatsapp.dto';
import { ApiResponse } from 'src/models';
import { SesionWhatsapp } from './entities/sesion_whatsapp.entity';
import { Response } from 'express';

@Controller('sesion-whatsapp')
export class SesionWhatsappController {
    constructor(
        private readonly sesionWhatsappService: SesionWhatsappService,
    ) {}

    @Post()
    create(@Body() createSesionWhatsappDto: CreateSesionWhatsappDto) {
        return this.sesionWhatsappService.create(createSesionWhatsappDto);
    }

    @Get()
    async findAll(@Res() res: Response) {
        try {
            const myRes = new ApiResponse<SesionWhatsapp[]>();
            myRes.status = 200;
            myRes.body = await this.sesionWhatsappService.findAllAndDeletes();
            myRes.mensaje = 'Se obtuvo correctamente';

            return res.status(myRes.status).send(myRes);
        } catch (error) {
            const myRes = new ApiResponse<String>();
            let err = error as Error;
            myRes.body = 'Error al obtener sesiones: ' + err.message;
            myRes.status = 409;
            myRes.mensaje = 'Se produjo un error en findAll de sesion_whatsapp';
            return res.status(myRes.status).send(myRes);
        }
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.sesionWhatsappService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateSesionWhatsappDto: UpdateSesionWhatsappDto,
    ) {
        return this.sesionWhatsappService.update(+id, updateSesionWhatsappDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.sesionWhatsappService.remove(+id);
    }
}
