import { Endpoint } from 'src/endpoint/entities/endpoint.entity';
import { RegistrandoEndpointDto } from './registrando-endpoint.dto';

export default class CacheEndpoint {
    mapRegistroEndpoint: Map<string, RegistrandoEndpointDto>;
    endpoint: Endpoint;
}
