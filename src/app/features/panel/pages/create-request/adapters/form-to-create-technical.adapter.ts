import { emptyToNull } from '../../../../../core/helpers/empty-to-null.helper';
import { CreateTechnicalSupportRequest, FormCreateRequest } from '../model/create-request.model';

export function createTechnicalSupportRequestAdapter(
  form: FormCreateRequest,
  userId: number,
  stateOpen: number,
): CreateTechnicalSupportRequest {
  return {
    state_id: stateOpen,
    request_type_id: form.requestTypeId,
    priority_id: form.priorityId,
    user_id: userId,
    support_mode_id: form.supportModeId,
    speciality: emptyToNull(form.speciality),
    office_number: emptyToNull(form.officeNumber),
    problem_description: emptyToNull(form.problemDescription),
    contact_phone: emptyToNull(form.contactPhone),
    anydesk_code: emptyToNull(form.anydeskCode),
    preferred_support_date: emptyToNull(form.preferredSupportDate),
  };
}
