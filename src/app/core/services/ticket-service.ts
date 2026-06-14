import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, NgZone, PLATFORM_ID, signal } from '@angular/core';
import { first, Observable, Subject, takeUntil } from 'rxjs';
import { Ticket } from '../models/ticket.model';
import { TicketComment } from '../models/ticket-comment.model';
import { CurrentUserService } from './current-user-service';
import { platformBrowser } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { WebNotificationService } from './web-notification-service';
import { environment } from '../../../environments/environment';

export interface TicketStateEvent {
  ticket_id: number;
  state_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly baseUrl = `${environment.apiUrl}/ticket`;
  private http = inject(HttpClient);
  private currentUserService = inject(CurrentUserService);

  readonly loading = signal(false);
  readonly initialized = signal(false);
  readonly error = signal(false);

  // Notificaciones para mostrar badge/toast en el UI
  readonly pendingNotifications = signal<TicketStateEvent[]>([]);

  // Incoming real-time comments pushed via SSE
  readonly pendingComments = signal<TicketComment[]>([]);

  // Tickets whose user messages were just marked as read by admin
  readonly pendingReadReceipts = signal<{ ticket_id: number }[]>([]);

  private onDestroy = new Subject<void>();
  private state = signal({ ticket: new Map<number, Ticket>() });
  private platformId = inject(PLATFORM_ID);

  private abortController: AbortController | null = null;
  private zone = inject(NgZone);
  private webNotif = inject(WebNotificationService);

  constructor() {
    effect(() => {
      const user = this.currentUserService.user();
      if (user === null) {
        this.clear();
        return;
      }
      this.loadData();
      this.conectarSSE();
    });
  }

  // ─── SSE ────────────────────────────────────────────────────

  private conectarSSE(): void {
    this.desconectarSSE();

    let token: string | null = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('access_token');
    }
    if (!token) return;

    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    fetch(`${this.baseUrl}/events`, {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    }).then((res) => {
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const read = () =>
        reader.read().then(({ done, value }) => {
          if (signal.aborted) return;
          if (done) {
            this.abortController = null;
            setTimeout(() => this.conectarSSE(), 3000);
            return;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            try {
              const data = JSON.parse(line.slice(5).trim());
              this.zone.run(() => this.handleSseEvent(data));
            } catch {}
          }
          read();
        }).catch(() => {
          if (!signal.aborted) {
            this.abortController = null;
            setTimeout(() => this.conectarSSE(), 3000);
          }
        });

      read();
    }).catch(() => {
      if (!signal.aborted) {
        this.abortController = null;
        setTimeout(() => this.conectarSSE(), 3000);
      }
    });
  }

  private handleSseEvent(data: any): void {
    if (data.type === 'ping') return;
    if (data.type === 'new_comment') {
      const comment = data.comment as TicketComment;
      this.pendingComments.update((prev) => [...prev, comment]);
      return;
    }
    if (data.type === 'messages_read') {
      this.pendingReadReceipts.update((prev) => [...prev, { ticket_id: data.ticket_id }]);
      return;
    }
    this.manejarEventoEstado(data as TicketStateEvent);
  }

  private desconectarSSE(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  private manejarEventoEstado(data: TicketStateEvent): void {
    // 1. Actualiza el caché local (igual que antes)
    const ticket = this.state().ticket.get(data.ticket_id);
    if (ticket) {
      const nuevoMapa = new Map(this.state().ticket);
      nuevoMapa.set(data.ticket_id, { ...ticket, state_id: data.state_id });
      this.state.set({ ticket: nuevoMapa });
    }

    // 2. Agrega notificación pendiente para badge/toast (igual que antes)
    this.pendingNotifications.update((prev) => [...prev, data]);

    // push notification is sent by the backend — no duplicate web notification needed here
  }

  // Llama esto cuando el usuario "vio" las notificaciones
  clearNotifications(): void {
    this.pendingNotifications.set([]);
  }

  // ─── Carga de datos ─────────────────────────────────────────

  loadData() {
    this.onDestroy.next();
    this.loading.set(true);
    this.error.set(false);
    this.http
      .get<Ticket[]>(this.baseUrl)
      .pipe(takeUntil(this.onDestroy), first())
      .subscribe({
        next: (response: Ticket[]) => {
          this.updateList(response.length ? response : []);
          this.loading.set(false);
          this.initialized.set(true);
        },
        error: () => {
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

  getByCode(code: string): Ticket | undefined {
    return this.getAll().find((t) => t.code === code);
  }

  // ─── Limpieza ───────────────────────────────────────────────

  private clear() {
    this.onDestroy.next();
    this.desconectarSSE(); // cierra la conexión SSE al cerrar sesión
    this.state.set({ ticket: new Map() });
    this.pendingNotifications.set([]);
    this.pendingComments.set([]);
    this.pendingReadReceipts.set([]);
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

  updateTicket(id: number, priorityId: number): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.baseUrl}`, { id, priority_id: priorityId });
  }

  deleteTicket(id: number): Observable<Ticket> {
    return this.http.delete<Ticket>(`${this.baseUrl}/${id}`);
  }

  getComments(ticketId: number): Observable<TicketComment[]> {
    return this.http.get<TicketComment[]>(`${environment.apiUrl}/ticket-comment/${ticketId}`);
  }

  sendComment(ticketId: number, message: string): Observable<TicketComment> {
    return this.http.post<TicketComment>(`${environment.apiUrl}/ticket-comment`, {
      ticket_id: ticketId,
      message,
    });
  }

  markUserRead(ticketId: number): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/ticket-comment/${ticketId}/read`, {});
  }
}
