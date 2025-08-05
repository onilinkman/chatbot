import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'SESION_WHATSAPP' })
export class SesionWhatsapp {
    @PrimaryGeneratedColumn({ name: 'id_sesion_whatsapp' })
    id_sesion_whatsapp: number;

    @Column({ type: 'varchar2', length: 25, unique: true })
    nombre: string;

    @Column({ type: 'varchar2', length: 25, unique: true })
    nombre_sesion: string;

    @Column({ type: 'varchar2', length: 25 })
    telefono: string;

    @Column({
        type: 'timestamp',
        name: 'updated_at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updaad_at: Date;

    @Column({
        type: 'number',
        default: () => 0,
    })
    eliminado: boolean;
}
