import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize, first, Subject, takeUntil } from 'rxjs';
import { HistoryTicketState } from '../models/historyTicketState.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HistoryTicketStateService {
  private readonly baseUrl = `${environment.apiUrl}/ticket-state-history`;
  private http = inject(HttpClient);
  readonly loading = signal(false);
  private onDestroy = new Subject<void>();

  getByTicketId(id: number) {
    this.loading.set(true);
    return this.http.get<HistoryTicketState[]>(`${this.baseUrl}/${id}`).pipe(
      takeUntil(this.onDestroy),
      first(),
      finalize(() => this.loading.set(false)),
    );
  }
}
