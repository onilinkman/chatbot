import { Repository } from 'typeorm';
import { RegistroAccion } from './entities/registro_accion.entity';
import { Telefono } from 'src/telefono/entities/telefono.entity';

export class RegistroAccionRepository extends Repository<RegistroAccion> {
    async findOneOrder(telefono: Telefono): Promise<RegistroAccion | null> {
        const ra = await this.createQueryBuilder('registro')
            .leftJoinAndSelect('registro.bot_respuesta', 'bot_respuesta')
            .leftJoinAndSelect('bot_respuesta.respuestas', 'respuestas')
            .where('registro.telefono = :telefono', { telefono: telefono })
            .andWhere('registro.eliminado = 0')
            .orderBy('registro.id_registro_accion', 'DESC')
            .addOrderBy('respuestas.id_registro_accion', 'ASC') // o DESC según prefieras
            .getOne();
        return ra;
    }
}
