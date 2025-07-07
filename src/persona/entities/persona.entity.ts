import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
