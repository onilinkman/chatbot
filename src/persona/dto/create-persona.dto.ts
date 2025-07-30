import { Auth } from "src/auth/entities/auth.entity";


export class CreatePersonaDto {
	ci:string;
	nombre:string;
	ap_paterno:string;
	ap_materno:string;
	celular:number;
	auth:Auth;
}
