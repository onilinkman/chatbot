import { Module } from '@nestjs/common';
import { BotRespuestaService } from './bot_respuesta.service';
import { BotRespuestaController } from './bot_respuesta.controller';
import { DataSource } from 'typeorm';
import { BotRespuestaRepository } from './bot_respuesta.repository';
import { BotRespuesta } from './entities/bot_respuesta.entity';
import { ArchivoModule } from 'src/archivo/archivo.module';

@Module({
    controllers: [BotRespuestaController],
    imports: [ArchivoModule],
    providers: [
        {
            provide: BotRespuestaRepository,
            useFactory: (dataSource: DataSource) =>
                dataSource
                    .getRepository(BotRespuesta)
                    .extend(BotRespuestaRepository.prototype),
            inject: [DataSource],
        },
        BotRespuestaService,
    ],
    exports: [BotRespuestaService],
})
export class BotRespuestaModule {}
