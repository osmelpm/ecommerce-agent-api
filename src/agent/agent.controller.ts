import { Body, Controller, Inject, Post, UsePipes } from '@nestjs/common';
import { UserMessageDto, UserMessageDtoSchema } from './dto';
import { ZodValidationPipe } from 'src/common/pipes';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(@Inject() private agentService: AgentService) {}

  @Post('chat')
  @UsePipes(new ZodValidationPipe(UserMessageDtoSchema))
  chat(@Body() { message, lang }: UserMessageDto) {
    return this.agentService.chat(message, lang);
  }
}
