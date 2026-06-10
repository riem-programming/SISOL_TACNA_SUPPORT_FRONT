import { CreateUserRequestChildren } from '../../../core/models/createUserRequest.model';
import { TechnicalSupportRequestChildren } from '../../../core/models/technical-support-request';
import { VoucherRequestChildren } from '../../../core/models/voucher-request.model';
import { Priority } from '../../../core/models/priority.model';
import { RequestType } from '../../../core/models/requestType.model';
import { StateTicket } from '../../../core/models/stateTicket.model';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
}

export interface AdminTicket {
  id: number;
  code: string;
  state_id: number;
  request_type_id: number;
  priority_id: number;
  user_id: number;
  is_active: boolean;
  createdAt: Date;
  updateddAt: Date;
  state?: StateTicket;
  priority?: Priority;
  request_type?: RequestType;
  user?: AdminUser;
  createUserRequest?: CreateUserRequestChildren;
  voucherRequest?: VoucherRequestChildren;
  technicalSupportRequest?: TechnicalSupportRequestChildren;
}
