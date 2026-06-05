import { Component, computed, inject, signal } from '@angular/core';
import { RequestTypeService } from '../../../../core/services/request-type-service';
import { PriorityService } from '../../../../core/services/priority-service';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Ticket } from '../../../../core/models/ticket.model';
import { form, FormField } from '@angular/forms/signals';
import { TicketService } from '../../../../core/services/ticket-service';
import { StateTicketService } from '../../../../core/services/state-ticket-service';

@Component({
  selector: 'app-my-request',
  imports: [MatInputModule, MatIconModule, FormField],
  templateUrl: './my-request.html',
  styleUrl: './my-request.css',
})
export default class MyRequest {
  private router = inject(Router);
  private requestTypeService = inject(RequestTypeService);
  private priorityService = inject(PriorityService);
  private ticketService = inject(TicketService);
  private stateTicketService = inject(StateTicketService);
  requestTypes = computed(() => this.requestTypeService.getAll().filter((v) => v.is_active));
  priorities = computed(() => this.priorityService.getAll());
  tickets = computed(() => this.ticketService.getAll());
  // "Not initialized yet" counts as loading so a cold load never
  // flashes the empty state before the first fetch starts
  loading = computed(() => !this.ticketService.initialized() || this.ticketService.loading());
  error = this.ticketService.error;

  retry() {
    this.ticketService.loadData();
  }
  stateTickets = computed(() => this.stateTicketService.getAll());

  // Signals de filtro — null significa "Todos"
  selectedType = signal<number | null>(null);
  selectedPriority = signal<number | null>(null);
  searchQuery = signal('');
  searchControl = form(this.searchQuery);

  filteredTickets = computed(() => {
    const q = this.searchQuery()?.toLowerCase() ?? '';
    const type = this.selectedType();
    const priority = this.selectedPriority();

    return this.tickets().filter((t) => {
      const matchSearch = !q || t.code.toLowerCase().includes(q);
      const matchType = type === null || t.request_type_id === type;
      const matchPriority = priority === null || t.priority_id === priority;
      return matchSearch && matchType && matchPriority;
    });
  });

  // Chips toggle: tapping the active chip clears that dimension
  toggleType(id: number) {
    this.selectedType.update((current) => (current === id ? null : id));
  }

  togglePriority(id: number) {
    this.selectedPriority.update((current) => (current === id ? null : id));
  }

  clearFilters() {
    this.selectedType.set(null);
    this.selectedPriority.set(null);
  }

  // Chat-style relative date: today -> HH:mm, yesterday -> "Ayer", older -> "dd MMM"
  formatTicketDate(value: Date): string {
    const date = new Date(value);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    if (date >= startOfToday) {
      return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    if (date >= startOfYesterday) {
      return 'Ayer';
    }
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  }

  goToTicket(code: string) {
    this.router.navigate(['/panel', 'solicitud', code]);
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

  getRequestType(id: number) {
    return this.requestTypeService.getById(id);
  }

  getTicketState(id: number) {
    return this.stateTicketService.getById(id);
  }

  getPriority(id: number) {
    return this.priorityService.getById(id);
  }
}
