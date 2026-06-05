import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TicketService } from '../../../../core/services/ticket-service';
import { StateTicketService } from '../../../../core/services/state-ticket-service';
import { RequestTypeService } from '../../../../core/services/request-type-service';
import { PriorityService } from '../../../../core/services/priority-service';
import { StatusTimeline } from './components/status-timeline/status-timeline';

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

  // Route param bound via withComponentInputBinding()
  code = input.required<string>();

  // Combined loading: the page resolves names from three catalogs that load
  // independently of the ticket cache. Treat "tickets not initialized yet"
  // as loading too, so direct URL entry never flashes the not-found state.
  loading = computed(
    () =>
      !this.ticketService.initialized() ||
      this.ticketService.loading() ||
      this.stateTicketService.loading() ||
      this.requestTypeService.loading() ||
      this.priorityService.loading(),
  );
  states = computed(() => this.stateTicketService.getAll());

  // Reads from the session cache; re-evaluates when loadData() fills it
  // on direct URL entry, so no individual request is needed.
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
