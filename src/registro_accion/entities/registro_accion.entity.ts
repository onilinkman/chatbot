import { BotRespuesta } from 'src/bot_respuesta/entities/bot_respuesta.entity';
import { Telefono } from 'src/telefono/entities/telefono.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'REGISTRO_ACCION' })
export class RegistroAccion {
    @PrimaryGeneratedColumn()
    id_registro_accion: number;

    @Column({ type: 'number', default: 0 })
    eliminado: number;

    @ManyToOne(() => Telefono, (telefono) => telefono.registro_acciones)
    @JoinColumn({ name: 'id_telefono' })
    telefono: Telefono;

    @ManyToOne(
        () => BotRespuesta,
        (bot_respuesta) => bot_respuesta.registro_acciones,
    )
	@JoinColumn({name:"id_bot_respuesta"})
    bot_respuesta: BotRespuesta;

	@Column({
        type: 'timestamp',
        name: 'fecha_registro',
        default: () => 'CURRENT_TIMESTAMP',
    })
	fecha_registro:Date;
}
