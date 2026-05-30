import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { form, FormField, hidden, maxLength, minLength, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { Card } from './components/card/card';
import { Button } from './components/button/button';
import { StatesService } from './services/states';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RequestTypeService } from '../../../../core/services/request-type-service';
import { FormCreateRequest } from './model/create-request.model';
import { SupportModeService } from '../../../../core/services/support-mode';
import { PriorityService } from '../../../../core/services/priority-service';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { searchSpecialties, SPECIALTIES } from '../../../../core/static/specialties';
import { MOTIVES, searchMotives } from '../../../../core/static/motives';
import { DocumentTypeService } from '../../../../core/services/document-type-service';
import { MatSelectModule } from '@angular/material/select';
import { ContractTypeService } from '../../../../core/services/contract-type-service';
import { SystemRoleService } from '../../../../core/services/system-role-service';
import { RequestType } from '../../../../core/models/requestType.model';
import { SupportMode } from '../../../../core/models/supportMode.model';

@Component({
  selector: 'app-create-request',
  imports: [
    MatStepperModule,
    FormField,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    Card,
    Button,
    MatDividerModule,
    MatAutocompleteModule,
    MatSelectModule,
  ],
  templateUrl: './create-request.html',
  styleUrl: './create-request.css',
})
export default class CreateRequest {
  private readonly statesService = inject(StatesService);
  private _snackBar = inject(MatSnackBar);
  private requestTypeService = inject(RequestTypeService);
  requestTypes = computed(() => this.requestTypeService.getAll().filter((v) => v.is_active));
  private supportModeService = inject(SupportModeService);
  supportModes = computed(() => this.supportModeService.getAll());
  private priorityService = inject(PriorityService);
  priorities = computed(() => this.priorityService.getAll());
  private documentTypeService = inject(DocumentTypeService);
  documentTypes = computed(() => this.documentTypeService.getAll());
  private contractTypeService = inject(ContractTypeService);
  contractTypes = computed(() => this.contractTypeService.getAll());
  private systemRoleService = inject(SystemRoleService);
  systemRoles = computed(() => this.systemRoleService.getAll());

  formCreateModel = signal<FormCreateRequest>({
    requestTypeId: null,
    supportModeId: null,
    priorityId: null,
    problemDescription: '',
    officeNumber: '',
    speciality: '',
    contactPhone: '',
    anydeskCode: '',
    preferredSupportDate: '',
    //
    motive: '',
    ticketNumber: '',
    //
    firstNames: '',
    lastNames: '',
    documentId: null,
    documentNumber: '',
    position: '',
    contractId: null,
    rolIds: null,
  });

  formCreate = form(this.formCreateModel, (schemaPath) => {
    required(schemaPath.requestTypeId, { message: 'El tipo de solicitud es obligatorio' });
    required(schemaPath.priorityId, { message: 'El estado de prioridad es obligatorio' });
    hidden(schemaPath.supportModeId, ({ valueOf }) => {
      const requestType = this.getRequestType(valueOf(schemaPath.requestTypeId));
      if (requestType === null) return true;

      return requestType.code === 'TICKET_RELEASE_LT30' ||
        requestType.code === 'TICKET_UNLOCK_GT30' ||
        requestType.code === 'CREDIT_NOTE_CREATE' ||
        requestType.code === 'CREDIT_NOTE_REVERT' ||
        requestType.code === 'USR_CREATE'
        ? true
        : false;
    });
    required(schemaPath.supportModeId, { message: 'El modo de soporte es obligatorio' });

    hidden(schemaPath.speciality, ({ valueOf }) => {
      const requestType = this.getRequestType(valueOf(schemaPath.requestTypeId));
      if (requestType === null) return true;

      const isVoucherAction =
        requestType.code === 'TICKET_RELEASE_LT30' ||
        requestType.code === 'TICKET_UNLOCK_GT30' ||
        requestType.code === 'CREDIT_NOTE_CREATE' ||
        requestType.code === 'CREDIT_NOTE_REVERT';

      if (isVoucherAction) return false;

      const supportMode = this.getSupportMode(valueOf(schemaPath.supportModeId));
      if (supportMode === null) return true;

      return supportMode.code !== 'in-person';
    });
    required(schemaPath.speciality, { message: 'La especilidad es obligatorio' });

    hidden(schemaPath.ticketNumber, ({ valueOf }) => {
      const requestType = this.getRequestType(valueOf(schemaPath.requestTypeId));
      if (requestType === null) return true;

      return requestType.code === 'TICKET_RELEASE_LT30' ||
        requestType.code === 'TICKET_UNLOCK_GT30' ||
        requestType.code === 'CREDIT_NOTE_CREATE' ||
        requestType.code === 'CREDIT_NOTE_REVERT'
        ? false
        : true;
    });
    required(schemaPath.ticketNumber, { message: 'El número ticket es obligatorio' });

    hidden(schemaPath.problemDescription, ({ valueOf }) => {
      const requestType = this.getRequestType(valueOf(schemaPath.requestTypeId));
      if (requestType === null) return true;

      return requestType.code === 'OTHER' ||
        requestType.code === 'SYSTEM_ISSUE' ||
        requestType.code === 'SIGNATURE_ISSUE'
        ? false
        : true;
    });
    required(schemaPath.problemDescription, { message: 'La descripción es obligatorio' });
    maxLength(schemaPath.problemDescription, 1000, { message: 'Máximo 1000 caracteres' });

    hidden(schemaPath.contactPhone, ({ valueOf }) => {
      const requestType = this.getRequestType(valueOf(schemaPath.requestTypeId));
      if (requestType === null) return true;

      const supportMode = this.getSupportMode(valueOf(schemaPath.supportModeId));
      if (supportMode === null) return true;

      return (requestType.code === 'OTHER' ||
        requestType.code === 'SYSTEM_ISSUE' ||
        requestType.code === 'SIGNATURE_ISSUE') &&
        supportMode.code === 'virtual'
        ? false
        : true;
    });
    required(schemaPath.contactPhone, { message: 'El número contacto es obligatorio' });

    hidden(schemaPath.preferredSupportDate, ({ valueOf }) => {
      const requestType = this.getRequestType(valueOf(schemaPath.requestTypeId));
      if (requestType === null) return true;

      return requestType.code === 'OTHER' ||
        requestType.code === 'SYSTEM_ISSUE' ||
        requestType.code === 'SIGNATURE_ISSUE'
        ? false
        : true;
    });
    required(schemaPath.preferredSupportDate, { message: 'El horario preferencia es obligatorio' });

    hidden(schemaPath.officeNumber, ({ valueOf }) => {
      const requestType = this.getRequestType(valueOf(schemaPath.requestTypeId));
      if (requestType === null) return true;

      const supportMode = this.getSupportMode(valueOf(schemaPath.supportModeId));
      if (supportMode === null) return true;

      return (requestType.code === 'OTHER' ||
        requestType.code === 'SYSTEM_ISSUE' ||
        requestType.code === 'SIGNATURE_ISSUE') &&
        supportMode.code === 'in-person'
        ? false
        : true;
    });
    required(schemaPath.officeNumber, { message: 'Número consultorio es obligatorio' });

    hidden(schemaPath.firstNames, ({ valueOf }) => {
      const requestType = this.getRequestType(valueOf(schemaPath.requestTypeId));
      if (requestType === null) return true;

      return requestType.code === 'USR_CREATE' ? false : true;
    });
    required(schemaPath.firstNames, { message: 'Los nombres son obligatorio' });

    hidden(schemaPath.lastNames, ({ valueOf }) => {
      const requestType = this.getRequestType(valueOf(schemaPath.requestTypeId));
      if (requestType === null) return true;

      return requestType.code === 'USR_CREATE' ? false : true;
    });
    required(schemaPath.lastNames, { message: 'Los apellidos son obligatorio' });

    hidden(schemaPath.documentId, ({ valueOf }) => {
      const requestType = this.getRequestType(valueOf(schemaPath.requestTypeId));
      if (requestType === null) return true;

      return requestType.code === 'USR_CREATE' ? false : true;
    });
    required(schemaPath.documentId, { message: 'El tipo documento es obligatorio' });

    hidden(schemaPath.documentNumber, ({ valueOf }) => {
      const requestType = this.getRequestType(valueOf(schemaPath.requestTypeId));
      if (requestType === null) return true;

      return requestType.code === 'USR_CREATE' ? false : true;
    });
    required(schemaPath.documentNumber, { message: 'El número documento es obligatorio' });

    hidden(schemaPath.position, ({ valueOf }) => {
      const requestType = this.getRequestType(valueOf(schemaPath.requestTypeId));
      if (requestType === null) return true;

      return requestType.code === 'USR_CREATE' ? false : true;
    });
    required(schemaPath.position, { message: 'El cargo es obligatorio' });

    hidden(schemaPath.contractId, ({ valueOf }) => {
      const requestType = this.getRequestType(valueOf(schemaPath.requestTypeId));
      if (requestType === null) return true;

      return requestType.code === 'USR_CREATE' ? false : true;
    });
    required(schemaPath.contractId, { message: 'El tipo contrato es obligatorio' });

    hidden(schemaPath.rolIds, ({ valueOf }) => {
      const requestType = this.getRequestType(valueOf(schemaPath.requestTypeId));
      if (requestType === null) return true;

      return requestType.code === 'USR_CREATE' ? false : true;
    });
    required(schemaPath.rolIds, { message: 'El rol es obligatorio' });
  });

  @ViewChild('stepper') stepper!: MatStepper;

  isKeyRequestTypeOk = this.statesService.getState('requestType');
  isKeySupportModeOk = this.statesService.getState('supportMode');
  isKeyPriorityOk = this.statesService.getState('priority');

  currentRequestType = computed(() => {
    const id = this.isKeyRequestTypeOk();
    if (id === null) return undefined;
    return this.requestTypeService.getById(id);
  });

  currentSupportMode = computed(() => {
    const id = this.isKeySupportModeOk();
    if (id === null) return undefined;
    return this.supportModeService.getById(id);
  });

  filteredSpecialtiesOption = computed(() => {
    const value = this.formCreateModel().speciality;
    if (SPECIALTIES.find((_) => _.label === value)) return [];
    return searchSpecialties(value);
  });

  filteredMotivesOption = computed(() => {
    const value = this.formCreateModel().motive;
    if (MOTIVES.find((_) => _.label === value)) return [];
    return searchMotives(value);
  });

  updateState(key: string, index: number) {
    switch (key) {
      case 'requestType':
        this.formCreateModel.update((current) => ({
          ...current,
          requestTypeId: index,
        }));
        break;
      case 'supportMode':
        this.formCreateModel.update((current) => ({
          ...current,
          supportModeId: index,
        }));
        break;
      case 'priority':
        this.formCreateModel.update((current) => ({
          ...current,
          priorityId: index,
        }));
        break;
    }
    this.statesService.updateState(key, index);

    setTimeout(() => {
      this.stepper.next();
    });
  }

  navegateNext(key: string) {
    const state = this.statesService.getState(key)();
    if (state === null) {
      this.openSnackBar('Seleccione una de las opciones', 'Cerrar');
      return;
    }
    this.stepper.next();
  }

  navegatePrevious() {
    this.stepper.previous();
  }

  private openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  submit() {
    console.log('Resultado: ', this.formCreateModel());
    this.formCreate().reset({
      requestTypeId: null,
      supportModeId: null,
      priorityId: null,
      problemDescription: '',
      officeNumber: '',
      speciality: '',
      contactPhone: '',
      anydeskCode: '',
      preferredSupportDate: '',
      //
      motive: '',
      ticketNumber: '',
      //
      firstNames: '',
      lastNames: '',
      documentId: null,
      documentNumber: '',
      position: '',
      contractId: null,
      rolIds: null,
    });
    this.stepper.reset();
    this.statesService.clearAll();
  }

  private getRequestType(id: number | null): null | RequestType {
    if (id === null) return null;
    const requestType = this.requestTypeService.getById(id);
    if (!requestType) return null;
    return requestType;
  }

  private getSupportMode(id: number | null): null | SupportMode {
    if (id === null) return null;
    const supportMode = this.supportModeService.getById(id);
    if (!supportMode) return null;
    return supportMode;
  }
}
