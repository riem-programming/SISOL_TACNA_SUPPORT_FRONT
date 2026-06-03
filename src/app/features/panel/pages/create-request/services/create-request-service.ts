import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, first, map, of, Subject, takeUntil } from 'rxjs';
import { FormCreateRequest } from '../model/create-request.model';
import { ErrorResponse } from '../../../../../core/models/error.model';
import { StateTicketService } from '../../../../../core/services/state-ticket-service';
import { CurrentUserService } from '../../../../../core/services/current-user-service';
import { createTechnicalSupportRequestAdapter } from '../adapters/form-to-create-technical.adapter';

@Injectable({
  providedIn: 'root',
})
export class CreateRequestService {
  private readonly baseUrl = 'http://localhost:3000';
  private http = inject(HttpClient);
  readonly loading = signal(false);
  private onDestroy = new Subject<void>();
  private stateTicketService = inject(StateTicketService);
  statesTicket = computed(() => this.stateTicketService.getAll());
  private currentUserService = inject(CurrentUserService);

  createTechnicalSupportRequest(data: FormCreateRequest) {
    this.onDestroy.next();
    this.loading.set(true);

    const stateOpen = this.stateTicketService.getAll().find((s) => s.code === 'open')?.id ?? 0;

    const currentUserId = this.currentUserService.user()?.id ?? 0;

    const body = createTechnicalSupportRequestAdapter(data, currentUserId, stateOpen);

    return this.http.post(`${this.baseUrl}/technical-support-request`, body).pipe(
      takeUntil(this.onDestroy),
      first(),
      map((response) => ({
        data: response,
        error: null,
      })),
      catchError((error) =>
        of({
          data: null,
          error: error.error as ErrorResponse,
        }),
      ),
      finalize(() => this.loading.set(false)),
    );
  }
}
