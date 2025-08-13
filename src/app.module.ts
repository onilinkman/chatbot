import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonaModule } from './persona/persona.module';
import { AuthModule } from './auth/auth.module';
import { SesionWhatsappModule } from './sesion_whatsapp/sesion_whatsapp.module';
import { BotRespuestaModule } from './bot_respuesta/bot_respuesta.module';
import { TelefonoModule } from './telefono/telefono.module';
import { RegistroAccionModule } from './registro_accion/registro_accion.module';
import { ArchivoModule } from './archivo/archivo.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
    imports: [
        BotModule,
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'oracle',
            host: process.env.DB_HOST ?? 'localhost',
            port: Number(process.env.DB_PORT ?? '1521'),
            username: process.env.DB_USERNAME ?? 'oracle',
            password: process.env.DB_PWD ?? 'oracle10',
            //sid: process.env.DB_SID ?? 'ORCLCDB',
            serviceName: process.env.DB_SID ?? 'ORCLCDB',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            autoLoadEntities: true,
            synchronize: true,
            /* logging: ['query', 'query', 'error'], */
        }),
        PersonaModule,
        AuthModule,
        SesionWhatsappModule,
        BotRespuestaModule,
        TelefonoModule,
        RegistroAccionModule,
        ArchivoModule,
        WhatsappModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
