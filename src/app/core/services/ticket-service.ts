import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { first, Subject, takeUntil } from 'rxjs';
import { Ticket } from '../models/ticket.model';
import { CurrentUserService } from './current-user-service';
import { platformBrowser } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { WebNotificationService } from './web-notification-service';

export interface TicketStateEvent {
  ticket_id: number;
  state_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly baseUrl = 'http://localhost:3000/ticket';
  private http = inject(HttpClient);
  private currentUserService = inject(CurrentUserService);

  readonly loading = signal(false);
  readonly initialized = signal(false);
  readonly error = signal(false);

  // Notificaciones para mostrar badge/toast en el UI
  readonly pendingNotifications = signal<TicketStateEvent[]>([]);

  private onDestroy = new Subject<void>();
  private state = signal({ ticket: new Map<number, Ticket>() });
  private platformId = inject(PLATFORM_ID);

  // Referencia al EventSource activo para poder cerrarlo
  private eventSource: EventSource | null = null;

  private webNotif = inject(WebNotificationService);

  constructor() {
    effect(() => {
      const user = this.currentUserService.user();
      if (user === null) {
        this.clear();
        return;
      }
      this.loadData();
      this.conectarSSE(user.id); // abre la conexión SSE al iniciar sesión
    });
  }

  // ─── SSE ────────────────────────────────────────────────────

  private conectarSSE(userId: number): void {
    // Cierra conexión anterior si existía (ej: cambio de usuario)
    this.desconectarSSE();

    let token = undefined;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('access_token'); // mismo key que el interceptor
    }
    if (!token) return; // no hay sesión activa

    const url = `${this.baseUrl}/events?userId=${userId}&token=${token}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      const data: TicketStateEvent = JSON.parse(event.data);
      this.manejarEventoEstado(data);
    };

    this.eventSource.onerror = () => {
      // EventSource reconecta automáticamente — no hacemos nada aquí.
      // Si quisieras mostrar un indicador de "sin conexión", este es el lugar.
    };
  }

  private desconectarSSE(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
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

    // 3. Notificación del sistema operativo + sonido
    const nombre = ticket?.code ?? `#${data.ticket_id}`;
    this.webNotif.notify(
      'Actualización de solicitud',
      `Tu ticket ${nombre} cambió de estado`,
      `/panel/solicitud/${ticket?.code}`,
    );
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
