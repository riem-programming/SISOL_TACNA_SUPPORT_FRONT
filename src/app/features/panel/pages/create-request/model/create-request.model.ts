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
}
