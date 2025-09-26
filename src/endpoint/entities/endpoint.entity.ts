import { BotRespuesta } from 'src/bot_respuesta/entities/bot_respuesta.entity';
import { Parametro } from 'src/parametro/entities/parametro.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'ENDPOINT' })
export class Endpoint {
    @PrimaryColumn()
    id_bot_respuesta: number;

    @Column({ type: 'varchar2', length: 10 })
    metodo: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

    @Column({ type: 'varchar2', length: 500 })
    url: string;

    @Column({ type: 'number', default: 0 })
    eliminado: number;
    //Parametros de como responder:
    @Column({ type: 'varchar2', length: 150 })
    tipo: string;

    @Column({ type: 'varchar2', length: 500 })
    descripcion: string;

    @OneToOne(() => BotRespuesta, (botRespuesta) => botRespuesta.endpoint)
    @JoinColumn({ name: 'id_bot_respuesta' })
    bot_respuesta: BotRespuesta;

    @OneToMany(() => Parametro, (parametro) => parametro.endpoint, {
        cascade: true,
    })
    parametros: Parametro[];
}
