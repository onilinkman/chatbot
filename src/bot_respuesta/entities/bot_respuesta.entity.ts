import { RegistroAccion } from 'src/registro_accion/entities/registro_accion.entity';
import { SesionWhatsapp } from 'src/sesion_whatsapp/entities/sesion_whatsapp.entity';
import {
    Column,
    Entity,
    IsNull,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';

@Unique(['nro', 'respuesta_origen'])
@Entity({ name: 'BOT_RESPUESTA' })
export class BotRespuesta {
    @PrimaryGeneratedColumn()
    id_bot_respuesta: number;

    @Column({ type: 'varchar2', length: 2000 })
    presentacion: string;

    @Column({ type: 'varchar2', length: 500 })
    mensaje: string;

    @Column({ type: 'number' })
    nro: number;

    @Column({ type: 'varchar2', length: 100, nullable: true })
    codigo_accion: string;

    @OneToMany(() => BotRespuesta, (respuestas) => respuestas.respuesta_origen)
    respuestas: BotRespuesta[];

    @ManyToOne(() => BotRespuesta, { nullable: true })
    @JoinColumn({ name: 'id_respuesta_origen' })
    respuesta_origen: BotRespuesta;

    @Column({ type: 'number', default: 0 })
    eliminado: number;

    @OneToMany(
        () => RegistroAccion,
        (registro_accion) => registro_accion.bot_respuesta,
    )
    registro_acciones: RegistroAccion[];

    @ManyToOne(() => SesionWhatsapp)
    @JoinColumn({ name: 'id_sesion_whatsapp' })
    sesionWhatsapp: SesionWhatsapp;
}
