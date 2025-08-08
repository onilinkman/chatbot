import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { SesionWhatsappService } from './sesion_whatsapp.service';
import { CreateSesionWhatsappDto } from './dto/create-sesion_whatsapp.dto';
import { UpdateSesionWhatsappDto } from './dto/update-sesion_whatsapp.dto';

@Controller('api/sesion-whatsapp')
export class SesionWhatsappController {
    constructor(
        private readonly sesionWhatsappService: SesionWhatsappService,
    ) {}

    @Post()
    create(@Body() createSesionWhatsappDto: CreateSesionWhatsappDto) {
        return this.sesionWhatsappService.create(createSesionWhatsappDto);
    }

    @Get()
    findAll() {
        return this.sesionWhatsappService.findAll();
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
