import { Auth } from 'src/auth/entities/auth.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Persona {
    @PrimaryGeneratedColumn()
    id_persona: number;

    @Column({ length: 20, unique: true })
    ci: string;

    @Column({ length: 40 })
    nombre: string;

    @Column({ length: 25 })
    ap_paterno: string;

    @Column({ length: 25 })
    ap_materno: string;

    @Column({ unique: true })
    celular: number;

    @OneToOne(() => Auth, (auth) => auth.persona, { cascade: true })
    auth: Auth;
}
