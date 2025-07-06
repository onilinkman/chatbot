import { Injectable } from '@nestjs/common';

@Injectable()
export class BotService {
  enviarMensaje() {
    return { mensaje: 'hola chris' };
  }
}
