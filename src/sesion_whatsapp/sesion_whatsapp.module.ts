import { Module } from '@nestjs/common';
import { SesionWhatsappService } from './sesion_whatsapp.service';
import { SesionWhatsappController } from './sesion_whatsapp.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SesionWhatsapp } from './entities/sesion_whatsapp.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SesionWhatsapp])],
    controllers: [SesionWhatsappController],
    providers: [SesionWhatsappService],
    exports: [SesionWhatsappService],
})
export class SesionWhatsappModule {}
