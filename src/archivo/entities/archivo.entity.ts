import { BotRespuesta } from 'src/bot_respuesta/entities/bot_respuesta.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

Entity({ name: 'ARCHIVO' });
export class Archivo {
    @PrimaryColumn()
    id_bot_respuesta: number;

    @Column({ type: 'varchar2', length: 128 })
    url: string;

    @Column({ type: 'varchar2', length: 80 })
    nombre_archivo: string;

    @Column({ type: 'varchar2',length:15 })
    tipo: string;

    @OneToOne(() => BotRespuesta)
    @JoinColumn({ name: 'id_bot_respuesta' })
    bot_respuesta: BotRespuesta;
}
