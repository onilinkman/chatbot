import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { PersonaService } from './persona.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/persona')
export class PersonaController {
    constructor(private readonly personaService: PersonaService) {}

    @Post()
    create(@Body() createPersonaDto: CreatePersonaDto) {
        return this.personaService.create(createPersonaDto);
    }

    @UseGuards(AuthGuard)
    @Get()
    findAll() {
        return this.personaService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.personaService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updatePersonaDto: UpdatePersonaDto,
    ) {
        return this.personaService.update(+id, updatePersonaDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.personaService.remove(+id);
    }
}
