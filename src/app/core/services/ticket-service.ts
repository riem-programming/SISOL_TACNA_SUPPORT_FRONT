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
  // True once the first load attempt has finished — lets consumers
  // distinguish "not loaded yet" from "loaded and not found"
  readonly initialized = signal(false);
  // True when the last load failed — lets lists show an explicit
  // error + retry instead of an ambiguous empty state
  readonly error = signal(false);
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
    this.error.set(false);
    this.http
      .get<Ticket[]>(this.baseUrl)
      .pipe(takeUntil(this.onDestroy), first())
      .subscribe({
        next: (response: Ticket[]) => {
          if (response.length === 0) {
            this.state.set({ ticket: new Map() });
            this.loading.set(false);
            this.initialized.set(true);
            return;
          }
          this.updateList(response);
          this.loading.set(false);
          this.initialized.set(true);
        },
        error: (_) => {
          this.state.set({ ticket: new Map() });
          this.loading.set(false);
          this.initialized.set(true);
          this.error.set(true);
        },
      });
  }

  getAll(): Ticket[] {
    return Array.from(this.state().ticket.values());
  }

  getById(id: number): Ticket | undefined {
    return this.state().ticket.get(id);
  }

  // Cache lookup by ticket code. On direct URL entry the session effect
  // in the constructor triggers loadData(), so callers reading this from
  // a computed() re-evaluate once the cache fills — no extra request needed.
  getByCode(code: string): Ticket | undefined {
    return this.getAll().find((t) => t.code === code);
  }

  private clear() {
    this.onDestroy.next(); // cancel any in-flight request
    this.state.set({ ticket: new Map() });
    this.loading.set(false);
    this.initialized.set(false);
    this.error.set(false);
  }

  private updateList(data: Ticket[]) {
    const map = new Map<number, Ticket>();
    for (const item of data) {
      map.set(item.id, item);
    }
    this.state.set({ ticket: map });
  }
}
