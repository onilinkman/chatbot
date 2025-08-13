import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Put,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { BotRespuestaService } from './bot_respuesta.service';
import { CreateBotRespuestaDto } from './dto/create-bot_respuesta.dto';
import { UpdateBotRespuestaDto } from './dto/update-bot_respuesta.dto';
import { ApiResponse } from 'src/models';
import { BotRespuesta } from './entities/bot_respuesta.entity';
import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('api/bot-respuesta')
export class BotRespuestaController {
    constructor(private readonly botRespuestaService: BotRespuestaService) {}

    @Post()
    create(@Body() createBotRespuestaDto: CreateBotRespuestaDto) {
        return this.botRespuestaService.create(createBotRespuestaDto);
    }

    @Get()
    findAll() {
        return this.botRespuestaService.findAll();
    }

    @Post('/upload/:id')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './public', // carpeta
                filename: (req, file, cb) => {
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Param('id') id_bot_respuesta: number,
    ) {
        console.log(file);
        this.botRespuestaService.saveFile(id_bot_respuesta, file);
        return { message: 'Archivo recibido', originalName: file.originalname };
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        const apiResponse = new ApiResponse<BotRespuesta[]>();
        const data = await this.botRespuestaService.findOne(+id);
        apiResponse.status = 200;
        apiResponse.mensaje = 'Se obtuvo correctamente la respuesta';
        apiResponse.body = data;
        return apiResponse;
    }

    @Get('getFirstQuestionBySesion/:id')
    async getFirstQuestionBySesion(@Param('id') id_bot_respuesta: number) {
        const apiResponse = new ApiResponse<BotRespuesta[]>();
        const data =
            await this.botRespuestaService.getFirstQuestionBySesion(
                id_bot_respuesta,
            );
        apiResponse.status = 200;
        apiResponse.mensaje = 'Se obtuvo correctamente las primeras respuestas';
        apiResponse.body = data;
        return apiResponse;
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateBotRespuestaDto: UpdateBotRespuestaDto,
    ) {
        return this.botRespuestaService.update(+id, updateBotRespuestaDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.botRespuestaService.remove(+id);
    }
}
