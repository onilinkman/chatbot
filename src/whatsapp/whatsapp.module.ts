import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { BotModule } from 'src/bot/bot.module';

@Module({
    controllers: [WhatsappController],
    imports: [BotModule],
    providers: [WhatsappService],
})
export class WhatsappModule {}
