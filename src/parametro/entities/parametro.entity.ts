import { Endpoint } from 'src/endpoint/entities/endpoint.entity';
import { ParamRespuesta } from 'src/param_respuesta/entities/param_respuesta.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'PARAMETRO' })
export class Parametro {
    @PrimaryGeneratedColumn()
    id_parametro: number;

    @Column({ type: 'varchar2', length: 50 })
    nombre: string;

    @Column({ type: 'varchar2', length: 10 })
    tipo: 'string' | 'number';

    @Column({ type: 'varchar2', length: 255 })
    descripcion: string;

    @Column({ type: 'number', default: 0 })
    eliminado: number;

    @ManyToOne(() => Endpoint, (endpoint) => endpoint.parametros, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'id_bot_respuesta' })
    endpoint: Endpoint;

    @OneToMany(
        () => ParamRespuesta,
        (paramRespuestas) => paramRespuestas.parametro,
    )
    paramRespuestas: ParamRespuesta[];
}
