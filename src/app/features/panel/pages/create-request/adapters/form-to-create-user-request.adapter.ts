import { CreateCreateUserRequest, FormCreateRequest } from '../model/create-request.model';

export function createCreateUserRequestAdapter(
  form: FormCreateRequest,
  userId: number,
  stateOpen: number,
): CreateCreateUserRequest {
  return {
    state_id: stateOpen,
    request_type_id: form.requestTypeId,
    priority_id: form.priorityId,
    user_id: userId,
    first_names: form.firstNames,
    last_names: form.lastNames,
    document_number: form.documentNumber,
    document_type_id: form.documentId,
    position: form.position,
    contract_type_id: form.contractId,
    system_role_ids: form.rolIds,
  };
}
