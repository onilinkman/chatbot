import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { EndpointService } from './endpoint.service';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { UpdateEndpointDto } from './dto/update-endpoint.dto';
import { PruebaQRDto } from './dto/prueba-qr.dto';

@Controller('endpoint')
export class EndpointController {
    constructor(private readonly endpointService: EndpointService) {}

    @Post()
    create(@Body() createEndpointDto: CreateEndpointDto) {
        return this.endpointService.create(createEndpointDto);
    }

    @Post('/prueba')
    pruebaQr(@Body() pruebaQr: PruebaQRDto) {
        console.log(pruebaQr);
        return 'https://pagos.libelula.bo/QrImages/11b4ddf809fc43deb8972b6558d323734828f54219d246f195282a77cc78b507.png';
    }

    @Get()
    findAll() {
        return this.endpointService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.endpointService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateEndpointDto: UpdateEndpointDto,
    ) {
        return this.endpointService.update(+id, updateEndpointDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.endpointService.remove(+id);
    }
}
