import { ContractType } from './contractType.model';
import { DocumentType } from './documentType.model';
import { SystemRole } from './systemRole.model';
import { Ticket } from './ticket.model';

export interface CreateUserRequest {
  id: number;
  first_names: string;
  last_names: string;
  document_number: string;
  position: string;
  ticket_id: number;
  ticket: Ticket;
  document_type_id: number;
  document_type: DocumentType;
  contract_type_id: number;
  contract_type: ContractType;
  system_roles: SystemRole[];
  is_active: boolean;
  createdAt: Date;
  updateddAt: Date;
}

export interface CreateUserRequestChildren extends Omit<
  CreateUserRequest,
  'ticket'
> {}
