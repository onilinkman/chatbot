import { Module } from '@nestjs/common';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { SesionWhatsappModule } from 'src/sesion_whatsapp/sesion_whatsapp.module';

@Module({
    imports: [SesionWhatsappModule],
    controllers: [BotController],
    providers: [BotService],
})
export class BotModule {}
