import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { first, Subject, takeUntil } from 'rxjs';
import { Ticket } from '../models/ticket.model';
import { CurrentUserService } from './current-user-service';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly baseUrl = 'http://localhost:3000/ticket';
  private http = inject(HttpClient);
  private currentUserService = inject(CurrentUserService);
  readonly loading = signal(false);
  private onDestroy = new Subject<void>();
  private state = signal({ ticket: new Map<number, Ticket>() });

  constructor() {
    // Cache lifecycle is bound to the session: each login loads the
    // current user's tickets, logout clears them. This prevents one
    // user's cached tickets from leaking into another user's session.
    effect(() => {
      const user = this.currentUserService.user();
      if (user === null) {
        this.clear();
        return;
      }
      this.loadData();
    });
  }

  loadData() {
    this.onDestroy.next();
    this.loading.set(true);
    this.http
      .get<Ticket[]>(this.baseUrl)
      .pipe(takeUntil(this.onDestroy), first())
      .subscribe({
        next: (response: Ticket[]) => {
          if (response.length === 0) {
            this.state.set({ ticket: new Map() });
            this.loading.set(false);
            return;
          }
          this.updateList(response);
          this.loading.set(false);
        },
        error: (_) => {
          this.state.set({ ticket: new Map() });
          this.loading.set(false);
        },
      });
  }

  getAll(): Ticket[] {
    return Array.from(this.state().ticket.values());
  }

  getById(id: number): Ticket | undefined {
    return this.state().ticket.get(id);
  }

  private clear() {
    this.onDestroy.next(); // cancel any in-flight request
    this.state.set({ ticket: new Map() });
    this.loading.set(false);
  }

  private updateList(data: Ticket[]) {
    const map = new Map<number, Ticket>();
    for (const item of data) {
      map.set(item.id, item);
    }
    this.state.set({ ticket: map });
  }
}
