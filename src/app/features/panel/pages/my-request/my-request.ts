import { Component, computed, inject, signal } from '@angular/core';
import { RequestTypeService } from '../../../../core/services/request-type-service';
import { PriorityService } from '../../../../core/services/priority-service';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Ticket } from '../../../../core/models/ticket.model';
import { DatePipe } from '@angular/common';
import { form, FormField } from '@angular/forms/signals';
import { TicketService } from '../../../../core/services/ticket-service';
import { StateTicketService } from '../../../../core/services/state-ticket-service';

@Component({
  selector: 'app-my-request',
  imports: [MatInputModule, MatSelectModule, MatIconModule, MatButtonModule, DatePipe, FormField],
  templateUrl: './my-request.html',
  styleUrl: './my-request.css',
  providers: [TicketService],
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

  goToTicket(code: string) {
    this.router.navigate(['/tickets', code]);
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

  openCreateDialog() {
    this.router.navigate(['panel', 'crear-solicitud']);
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
