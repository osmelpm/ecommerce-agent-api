import { tool } from '@langchain/core/tools';
import { HelpdeskService } from 'src/support/helpdesk.service';
import { CreateTicketDto, CreateTicketDtoSchema } from 'src/support/dto';

export function makeHandoffTool(helpdeskService: HelpdeskService) {
  return tool(
    async (input: CreateTicketDto) => {
      const ticket = await helpdeskService.createTicket(input);

      if (!ticket) {
        return { error: 'HANDOFF_FAILED' };
      }

      return {
        ticketId: ticket.ticketId,
        eta: ticket.eta ?? 'within 1 business day',
        url: ticket.url ?? null,
      };
    },
    {
      name: 'handoff_to_human',
      description:
        'Create a helpdesk ticket and route the conversation to a human agent.',
      schema: CreateTicketDtoSchema,
    },
  );
}
