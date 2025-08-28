import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Req,
    Res,
} from '@nestjs/common';
import { BotService } from './bot.service';
import { Request, Response } from 'express';
import PostMensajeDto from './dto/post-mensaje.dto';
import { ApiResponse } from 'src/models';

@Controller('api/bot')
export class BotController {
    constructor(private readonly botService: BotService) {}

    /* @Get()
  getAllBots() {
    return this.botService.enviarMensaje();
  } */

    @Post('/enviar/:clientName')
    async postMensaje(
        @Body() postMensajeDto: PostMensajeDto,
        @Param('clientName') clientName: string,
    ) {
        //Nota: enviar con este formato: 59179161442@s.whatsapp.net
        const myRes = new ApiResponse<String>();
        try {
            await this.botService.enviarMensaje(
                clientName,
                postMensajeDto.nro_telefono,
                postMensajeDto.mensaje,
            );
            myRes.status = 201;
            myRes.mensaje = 'Se envio mensaje correctamente';
            myRes.body = 'Mensaje enviado';
            return myRes;
        } catch (error) {
            const err = error as Error;
            return { body: 'error: ' + err.message };
        }
    }

    @Get('/conectar/:clientName')
    conectarWhatsapp(
        @Req() request: Request,
        @Res() response: Response,
        @Param('clientName') clientName: string,
    ) {
        let sent = false;
        //this.botService.generarNuevoQr
        this.botService.generarNuevoQr(clientName, (qrUrl) => {
            if (sent) return;
            sent = true;
            const base64Data = qrUrl.replace(/^data:image\/png;base64,/, '');
            const imgBuffer = Buffer.from(base64Data, 'base64');
            response.setHeader('Content-Type', 'image/png');
            response.status(200).send(imgBuffer);
        });
        /* this.botService.conectarWhatsapp();
        return response.status(200).send({
            mensaje: 'hola',
        }); */
    }

    @Delete('/sesion/:id')
    deleteSesionWhatsapp(@Param('id') id_sesion: number, @Res() res: Response) {
        let apiResponse = new ApiResponse();
        try {
            this.botService.deleteSesionWhatsapp(id_sesion, 1);
            apiResponse.status = 200;
            apiResponse.body = 'Se inhabilito correctamente';
            apiResponse.mensaje = 'Se rehabilito correctamente';
            res.status(apiResponse.status).send(apiResponse);
        } catch (error) {
            const err = error as Error;
            apiResponse.status = 409;
            apiResponse.body = 'Error al inhabilitar: ' + err.message;
            apiResponse.mensaje = 'Error al inhabilitar: ' + err.message;
            res.status(apiResponse.status).send(apiResponse);
        }
    }

    @Put('/restaurar/:id')
    restoreSesionWhatsapp(
        @Param('id') id_sesion: number,
        @Res() res: Response,
    ) {
        let apiResponse = new ApiResponse();
        try {
            this.botService.restoreSesionWhatsapp(id_sesion);
            apiResponse.status = 200;
            apiResponse.body = 'Se habilito correctamente';
            apiResponse.mensaje = 'Se habilito correctamente';
            res.status(apiResponse.status).send(apiResponse);
        } catch (error) {
            const err = error as Error;
            apiResponse.status = 409;
            apiResponse.body = 'Error al habilitar: ' + err.message;
            apiResponse.mensaje = 'Error al habilitar: ' + err.message;
            res.status(apiResponse.status).send(apiResponse);
        }
    }
}
