import { emptyToNull } from '../../../../../core/helpers/empty-to-null.helper';
import { CreateVoucherRequest, FormCreateRequest } from '../model/create-request.model';

export function createVoucherRequestAdapter(
  form: FormCreateRequest,
  userId: number,
  stateOpen: number,
  voucherActionTypeId: number,
): CreateVoucherRequest {
  return {
    state_id: stateOpen,
    request_type_id: form.requestTypeId,
    priority_id: form.priorityId,
    user_id: userId,
    voucher_action_type_id: voucherActionTypeId,
    voucher_code: form.ticketNumber,
    speciality: form.speciality,
    motive: emptyToNull(form.motive),
  };
}
