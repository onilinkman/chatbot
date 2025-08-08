import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BotRespuestaService } from './bot_respuesta.service';
import { CreateBotRespuestaDto } from './dto/create-bot_respuesta.dto';
import { UpdateBotRespuestaDto } from './dto/update-bot_respuesta.dto';

@Controller('api/bot-respuesta')
export class BotRespuestaController {
  constructor(private readonly botRespuestaService: BotRespuestaService) {}

  @Post()
  create(@Body() createBotRespuestaDto: CreateBotRespuestaDto) {
    return this.botRespuestaService.create(createBotRespuestaDto);
  }

  

  @Get()
  findAll() {
    return this.botRespuestaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.botRespuestaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBotRespuestaDto: UpdateBotRespuestaDto) {
    return this.botRespuestaService.update(+id, updateBotRespuestaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.botRespuestaService.remove(+id);
  }
}
