import { Module } from '@nestjs/common';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { SesionWhatsappModule } from 'src/sesion_whatsapp/sesion_whatsapp.module';
import { RegistroAccionModule } from 'src/registro_accion/registro_accion.module';

@Module({
    imports: [SesionWhatsappModule, RegistroAccionModule],
    controllers: [BotController],
    providers: [BotService],
})
export class BotModule {}
