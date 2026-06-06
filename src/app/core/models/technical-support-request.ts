import { SupportMode } from './supportMode.model';
import { Ticket } from './ticket.model';

export interface TechnicalSupportRequest {
  id: number;
  ticket_id: number;
  ticket: Ticket;
  support_mode_id: number;
  supportMode: SupportMode;
  speciality: null;
  office_number: null;
  problem_description: string;
  contact_phone: string;
  anydesk_code: string;
  preferred_support_date: string;
  is_active: boolean;
  createdAt: Date;
  updateddAt: Date;
}

export interface TechnicalSupportRequestChildren extends Omit<
  TechnicalSupportRequest,
  'supportMode' | 'ticket'
> {}
