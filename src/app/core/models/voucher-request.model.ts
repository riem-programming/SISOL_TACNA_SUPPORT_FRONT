import { Ticket } from './ticket.model';
import { VoucherActionType } from './voucherActionType.model';

export interface VoucherRequest {
  id: number;
  ticket_id: number;
  ticket: Ticket;
  voucher_action_type_id: number;
  voucher_action_type: VoucherActionType;
  voucher_code: string;
  speciality: string;
  motive: null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VoucherRequestChildren extends Omit<
  VoucherRequest,
  'ticket' | 'voucher_action_type'
> {}
