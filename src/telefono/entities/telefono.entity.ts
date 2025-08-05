import { RegistroAccion } from 'src/registro_accion/entities/registro_accion.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'TELEFONO' })
export class Telefono {
    @PrimaryGeneratedColumn()
    id_telefono: number;

    @Column({ unique: true, type: 'varchar2', length: 25 })
    nro_telefono: string;

    @Column({ type: 'varchar2', length: 5 })
    codigo_region: string;

    @Column({ type: 'number' })
    eliminado: number;

    @OneToMany(
        () => RegistroAccion,
        (registro_accion) => registro_accion.telefono,
    )
    registro_acciones: RegistroAccion[];
}
