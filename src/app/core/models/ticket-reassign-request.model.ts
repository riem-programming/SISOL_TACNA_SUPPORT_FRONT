import { Ticket } from './ticket.model';

export interface TicketReassignRequest {
  id: number;
  ticket_id: number;
  ticket: Ticket;
  ticket_numbers: string[];
  new_responsible: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketReassignRequestChildren extends Omit<
  TicketReassignRequest,
  'ticket'
> {}
