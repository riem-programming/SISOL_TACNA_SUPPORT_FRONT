import { CreateUserRequestChildren } from './createUserRequest.model';
import { TechnicalSupportRequestChildren } from './technical-support-request';
import { VoucherRequestChildren } from './voucher-request.model';

export interface Ticket {
  id: number;
  code: string;
  state_id: number;
  request_type_id: number;
  priority_id: number;
  user_id: number;
  is_active: boolean;
  createdAt: Date;
  updateddAt: Date;
  technicalSupportRequest?: TechnicalSupportRequestChildren;
  voucherRequest?: VoucherRequestChildren;
  createUserRequest?: CreateUserRequestChildren;
}

export interface TicketStateEvent {
  ticket_id: number;
  state_id: number;
}
