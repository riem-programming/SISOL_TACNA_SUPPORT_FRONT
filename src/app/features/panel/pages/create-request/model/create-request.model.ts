export interface FormCreateRequest {
  requestTypeId: number | null;
  supportModeId: number | null;
  priorityId: number | null;
  problemDescription: string;
  officeNumber: string;
  speciality: string;
  contactPhone: string;
  anydeskCode: string;
  preferredSupportDate: string;
  //
  motive: string;
  ticketNumber: string;
  //
  firstNames: string;
  lastNames: string;
  //
  documentId: number | null;
  documentNumber: string;
  position: string;
  contractId: number | null;
  rolIds: number[] | null;
  attachments: File | null;
}

export interface CreateTechnicalSupportRequest {
  state_id: number;
  request_type_id: number | null;
  priority_id: number | null;
  user_id: number;
  support_mode_id: number | null;
  speciality: string | null;
  office_number: string | null;
  problem_description: string | null;
  contact_phone: string | null;
  anydesk_code: string | null;
  preferred_support_date: string | null;
}
