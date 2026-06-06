import { StateTicket } from './stateTicket.model';

export interface HistoryTicketState {
  id: number;
  ticket_id: number;
  state_id: number;
  createdAt: Date;
  state: StateTicket;
}
