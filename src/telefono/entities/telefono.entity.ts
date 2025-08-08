import { RegistroAccion } from 'src/registro_accion/entities/registro_accion.entity';
import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';

@Entity({ name: 'TELEFONO' })
export class Telefono {
    @PrimaryGeneratedColumn()
    id_telefono: number;

    @Column({ type: 'varchar2', length: 25, unique: true })
    nro_telefono: string;

    @Column({ type: 'varchar2', length: 5, nullable: true })
    codigo_region: string;

    @Column({ type: 'number', default: 0 })
    eliminado: number;

    @OneToMany(
        () => RegistroAccion,
        (registro_accion) => registro_accion.telefono,
    )
    registro_acciones: RegistroAccion[];
}
