import { CreateParametroDto } from 'src/parametro/dto/create-parametro.dto';

export class CreateEndpointDto {
    metodo: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
    url: string;
    tipo: string;
    descripcion: string;
    id_bot_respuesta: number;
    parametros: CreateParametroDto[] | null;
}
