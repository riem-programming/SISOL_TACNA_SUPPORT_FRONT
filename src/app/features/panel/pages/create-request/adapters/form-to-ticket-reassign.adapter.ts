import { CreateTicketReassignRequest, FormCreateRequest } from '../model/create-request.model';

export function createTicketReassignRequestAdapter(
  form: FormCreateRequest,
  userId: number,
  stateId: number,
): CreateTicketReassignRequest {
  return {
    state_id: stateId,
    request_type_id: form.requestTypeId,
    priority_id: form.priorityId,
    user_id: userId,
    ticket_numbers: form.ticketNumbers ?? [],
    new_responsible: form.newResponsible,
  };
}
