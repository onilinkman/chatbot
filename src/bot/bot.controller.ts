import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { BotService } from './bot.service';
import { Request, Response } from 'express';
import PostMensajeDto from './dto/post-mensaje.dto';

@Controller('api/bot')
export class BotController {
    constructor(private readonly botService: BotService) {}

    /* @Get()
  getAllBots() {
    return this.botService.enviarMensaje();
  } */

    @Post('/enviar')
    async postMensaje(@Body() postMensajeDto: PostMensajeDto) {
        //Nota: enviar con este formato: 59179161442@s.whatsapp.net
        try {
            await this.botService.enviarMensaje(
                postMensajeDto.clientName,
                postMensajeDto.nro_telefono,
                postMensajeDto.mensaje,
            );
            return { body: 'Mensaje enviado' };
        } catch (error) {}
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
}
