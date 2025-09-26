import { Parametro } from 'src/parametro/entities/parametro.entity';
import { RegistroAccion } from 'src/registro_accion/entities/registro_accion.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'PARAM_RESPUESTA' })
export class ParamRespuesta {
    @PrimaryGeneratedColumn()
    id_param_respuesta: number;

    @Column({ type: 'varchar2', length: 150 })
    nombre: string;

    @ManyToOne(() => Parametro, (parametro) => parametro.paramRespuestas)
    @JoinColumn({ name: 'id_parametro' })
    parametro: Parametro;

    @ManyToOne(
        () => RegistroAccion,
        (registroAccion) => registroAccion.paramRespuestas,
    )
    @JoinColumn({ name: 'id_registro_accion' })
    registro_accion: RegistroAccion;
}
