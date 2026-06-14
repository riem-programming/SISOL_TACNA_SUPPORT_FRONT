import { inject, Injectable, signal } from '@angular/core';
import { StateTicket } from '../models/stateTicket.model';
import { first, Subject, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StateTicketService {
  private readonly baseUrl = `${environment.apiUrl}/state`;
  private http = inject(HttpClient);
  readonly loading = signal(false);
  private onDestroy = new Subject<void>();
  private state = signal({ stateTicket: new Map<number, StateTicket>() });

  constructor() {
    this.loadData();
  }

  loadData() {
    this.onDestroy.next();
    this.loading.set(true);
    this.http
      .get<StateTicket[]>(this.baseUrl)
      .pipe(takeUntil(this.onDestroy), first())
      .subscribe({
        next: (response: StateTicket[]) => {
          if (response.length === 0) {
            this.state.set({ stateTicket: new Map() });
            this.loading.set(false);
            return;
          }
          this.updateList(response);
          this.loading.set(false);
        },
        error: (_) => {
          this.state.set({ stateTicket: new Map() });
          this.loading.set(false);
        },
      });
  }

  getAll(): StateTicket[] {
    return Array.from(this.state().stateTicket.values());
  }

  getById(id: number): StateTicket | undefined {
    return this.state().stateTicket.get(id);
  }

  private updateList(data: StateTicket[]) {
    const map = new Map<number, StateTicket>();
    for (const item of data) {
      map.set(item.id, item);
    }
    this.state.set({ stateTicket: map });
  }
}
