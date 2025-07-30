import { Persona } from 'src/persona/entities/persona.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Auth {
  @PrimaryColumn()
  id_persona: number;

  @Column({ length: 30 })
  username: string;

  @Column({ length: 60 })
  password: string;

  @OneToOne(() => Persona, (persona) => persona.auth)
  @JoinColumn({ name: 'id_persona' })
  persona: Persona;
}
