import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TicketService } from '../../../../core/services/ticket-service';
import { StateTicketService } from '../../../../core/services/state-ticket-service';
import { RequestTypeService } from '../../../../core/services/request-type-service';
import { PriorityService } from '../../../../core/services/priority-service';
import { StatusTimeline } from './components/status-timeline/status-timeline';
import { HistoryTicketStateService } from '../../../../core/services/history-ticket-state-service';
import { HistoryTicketState } from '../../../../core/models/historyTicketState.model';

@Component({
  selector: 'app-ticket-detail',
  imports: [MatIconModule, RouterLink, StatusTimeline],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.css',
})
export default class TicketDetail {
  private ticketService = inject(TicketService);
  private stateTicketService = inject(StateTicketService);
  private requestTypeService = inject(RequestTypeService);
  private priorityService = inject(PriorityService);
  private historyService = inject(HistoryTicketStateService);

  code = input.required<string>();

  loading = computed(
    () =>
      !this.ticketService.initialized() ||
      this.ticketService.loading() ||
      this.stateTicketService.loading() ||
      this.requestTypeService.loading() ||
      this.priorityService.loading(),
  );

  states = computed(() => this.stateTicketService.getAll());
  ticket = computed(() => this.ticketService.getByCode(this.code()));

  requestType = computed(() => {
    const t = this.ticket();
    return t ? this.requestTypeService.getById(t.request_type_id) : undefined;
  });

  priority = computed(() => {
    const t = this.ticket();
    return t ? this.priorityService.getById(t.priority_id) : undefined;
  });

  state = computed(() => {
    const t = this.ticket();
    return t ? this.stateTicketService.getById(t.state_id) : undefined;
  });

  ticketHistory = signal<HistoryTicketState[]>([]);

  constructor() {
    // Carga el historial inicial cuando el ticket esté disponible
    effect(() => {
      const ticketId = this.ticket()?.id;
      if (!ticketId) return;
      this.cargarHistorial(ticketId);
    });

    // Recarga el historial cuando llegue un SSE de este ticket
    effect(() => {
      const notifs = this.ticketService.pendingNotifications();
      const ticketId = this.ticket()?.id;
      if (!ticketId || !notifs.length) return;

      const isThisTicket = notifs.some((n) => n.ticket_id === ticketId);
      if (isThisTicket) {
        this.cargarHistorial(ticketId);
      }
    });
  }

  private cargarHistorial(ticketId: number): void {
    this.historyService.getByTicketId(ticketId).subscribe({
      next: (history) => this.ticketHistory.set(history),
    });
  }

  getStateBadgeClass(stateCode?: string): string {
    const map: Record<string, string> = {
      pending: 'badge-pending',
      open: 'badge-open',
      review: 'badge-review',
      closed: 'badge-closed',
    };
    return map[stateCode ?? ''] ?? 'badge-pending';
  }

  getPriorityDotClass(priorityCode?: string): string {
    const map: Record<string, string> = {
      low: 'dot-low',
      medium: 'dot-medium',
      high: 'dot-high',
    };
    return map[priorityCode ?? ''] ?? 'dot-low';
  }

  formatFullDate(value: Date): string {
    return new Date(value).toLocaleDateString('es-PE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
