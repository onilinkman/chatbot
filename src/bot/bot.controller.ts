import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { BotService } from './bot.service';
import { Request, Response } from 'express';
import PostMensajeDto from './dto/post-mensaje.dto';

@Controller('bot')
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
        postMensajeDto.nro_telefono,
        postMensajeDto.mensaje,
      );
      return { body: 'Mensaje enviado' };
    } catch (error) {}
  }

  @Get('/conectar')
  conectarWhatsapp(@Req() request: Request, @Res() response: Response) {
    this.botService.conectarWhatsapp();
    return response.status(200).send({
      mensaje: 'hola',
    });
  }
}
