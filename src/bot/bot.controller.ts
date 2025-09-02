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
import EnviarMensajeDto from './dto/enviar-mensaje.dto';
import { logAlert } from 'src/Herramientas/herramienta.func';

@Controller('whatsapp')
export class BotController {
    constructor(private readonly botService: BotService) {}

    @Post('/enviarMensaje')
    async enviarMensaje(@Body() body: EnviarMensajeDto, @Res() res: Response) {
        try {
            await this.botService.enviarMensaje(
                'client-one',
                `591${body.telefono}`,
                body.mensaje,
            );
            logAlert(
                'mensaje directo por "/enviarMensaje": ' +
                    `591${body.telefono} ${body.mensaje}`,
            );
            return res.status(200).send('Mensaje enviado correctamente');
        } catch (error) {
            const err = error as Error;
            return res.status(409).send('Error al enviar: ' + err.message);
        }
    }

    @Post('/enviarMensaje/:clientName')
    async postMensaje(
        @Body() postMensajeDto: EnviarMensajeDto,
        @Param('clientName') clientName: string,
        @Res() res: Response,
    ) {
        //Nota: enviar con este formato: 59179161442@s.whatsapp.net
        const myRes = new ApiResponse<String>();
        try {
            await this.botService.enviarMensaje(
                clientName,
                `591${postMensajeDto.telefono}`,
                postMensajeDto.mensaje,
            );
            logAlert(
                `mensaje directo por "${clientName}": ` +
                    `591${postMensajeDto.telefono} ${postMensajeDto.mensaje}`,
            );
            myRes.status = 200;
            myRes.mensaje = 'Se envio mensaje correctamente';
            myRes.body = 'Mensaje enviado';
            return res.status(myRes.status).send(myRes);
        } catch (error) {
            const err = error as Error;
            myRes.status = 409;
            myRes.mensaje = 'Error al enviar mensaje: ' + err.message;
            myRes.body = 'Error al enviar mensaje: ' + err.message;
            return res.status(myRes.status).send(myRes);
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
