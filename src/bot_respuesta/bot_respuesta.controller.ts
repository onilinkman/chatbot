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
    Res,
} from '@nestjs/common';
import { BotRespuestaService } from './bot_respuesta.service';
import { CreateBotRespuestaDto } from './dto/create-bot_respuesta.dto';
import { UpdateBotRespuestaDto } from './dto/update-bot_respuesta.dto';
import { ApiResponse } from 'src/models';
import { BotRespuesta } from './entities/bot_respuesta.entity';
import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';

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
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Param('id') id_bot_respuesta: number,
        @Res() res: Response,
    ) {
        const apiResponse = new ApiResponse<String>();
        try {
            await this.botRespuestaService.saveFile(id_bot_respuesta, file);
            apiResponse.body = 'Archivo guardado: ' + file.originalname;
            apiResponse.status = 201;
            apiResponse.mensaje = 'Se guardo correctamente';

            return res.status(apiResponse.status).send(apiResponse);
        } catch (error) {
            const err = error as Error;
            apiResponse.body = 'No se pudo guardar el archivo correctamente';
            apiResponse.status = 409;
            apiResponse.mensaje = 'Error al guardar el archivo: ' + err.message;
            return res.status(apiResponse.status).send(apiResponse);
        }
    }

    @Delete('/deleteFile/:id')
    async deleteFile(
        @Param('id') id_bot_respuesta: number,
        @Res() res: Response,
    ) {
        const apiResponse = new ApiResponse<String>();
        try {
            let df =
                await this.botRespuestaService.deleteFile(id_bot_respuesta);
            apiResponse.mensaje = 'Eliminado correctamente';
            apiResponse.body = 'siiiiii';
            apiResponse.status = 200;
            return res.status(apiResponse.status).send(apiResponse);
        } catch (error) {
            let err = error as Error;
            apiResponse.mensaje = 'No se elimino correctamente: ' + err.message;
            apiResponse.body = 'Error al eliminar';
            apiResponse.status = 409;
            return res.status(apiResponse.status).send(apiResponse);
        }
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
