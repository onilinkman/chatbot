import { PartialType } from '@nestjs/mapped-types';
import { CreateSesionWhatsappDto } from './create-sesion_whatsapp.dto';

export class UpdateSesionWhatsappDto extends PartialType(CreateSesionWhatsappDto) {
	creds: string;
    keys?: string;
}
