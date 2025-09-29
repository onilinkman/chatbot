import { Parametro } from 'src/parametro/entities/parametro.entity';

export class RegistrandoEndpointDto {
    parametro: Parametro;
    respuesta: string | number | null;
    tipo: 'img' | 'text';
}
