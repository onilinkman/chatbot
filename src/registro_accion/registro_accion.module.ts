import { Module } from '@nestjs/common';
import { RegistroAccionService } from './registro_accion.service';
import { RegistroAccionController } from './registro_accion.controller';
import { RegistroAccionRepository } from './registro_accion.repository';
import { DataSource } from 'typeorm';
import { RegistroAccion } from './entities/registro_accion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Telefono } from 'src/telefono/entities/telefono.entity';
import { BotRespuestaService } from 'src/bot_respuesta/bot_respuesta.service';
import { BotRespuestaModule } from 'src/bot_respuesta/bot_respuesta.module';

@Module({
    controllers: [RegistroAccionController],
    imports: [TypeOrmModule.forFeature([Telefono]), BotRespuestaModule],
    providers: [
        {
            provide: RegistroAccionRepository,
            useFactory: (dataSource: DataSource) =>
                dataSource
                    .getRepository(RegistroAccion)
                    .extend(RegistroAccionRepository.prototype),
            inject: [DataSource],
        },
        RegistroAccionService,
    ],
    exports: [RegistroAccionService],
})
export class RegistroAccionModule {}
