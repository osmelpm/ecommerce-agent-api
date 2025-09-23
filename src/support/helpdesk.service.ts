import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto';

@Injectable()
export class HelpdeskService {
  async createTicket(input: CreateTicketDto) {
    console.log('Creating ticket with input:', input);
    // Simulate ticket creation logic
    const ticketId = `TICKET-${Math.floor(Math.random() * 10000)}`;
    const eta = 'within 24 hours';
    const url = `https://helpdesk.example.com/tickets/${ticketId}`;

    return { ticketId, eta, url };
  }
}
