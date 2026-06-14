import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TicketService } from '../../../../core/services/ticket-service';
import { StateTicketService } from '../../../../core/services/state-ticket-service';
import { RequestTypeService } from '../../../../core/services/request-type-service';
import { PriorityService } from '../../../../core/services/priority-service';
import { StatusTimeline } from './components/status-timeline/status-timeline';
import { HistoryTicketStateService } from '../../../../core/services/history-ticket-state-service';
import { HistoryTicketState } from '../../../../core/models/historyTicketState.model';
import { TicketAttachmentService } from '../../../../core/services/ticket-attachment';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Eliminar solicitud</h2>
    <mat-dialog-content>
      <p>¿Estás seguro de que querés eliminar la solicitud <strong>{{ data.code }}</strong>? Esta acción no se puede deshacer.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton (click)="ref.close(false)">Cancelar</button>
      <button matButton="filled" color="warn" (click)="ref.close(true)">Eliminar</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDeleteDialog {
  data = inject<{ code: string }>(MAT_DIALOG_DATA);
  ref = inject(MatDialogRef<ConfirmDeleteDialog>);
}

@Component({
  selector: 'app-ticket-detail',
  imports: [MatIconModule, MatButtonModule, MatBadgeModule, MatDialogModule, RouterLink, StatusTimeline],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.css',
})
export default class TicketDetail {
  private ticketService = inject(TicketService);
  private stateTicketService = inject(StateTicketService);
  private requestTypeService = inject(RequestTypeService);
  private priorityService = inject(PriorityService);
  private historyService = inject(HistoryTicketStateService);
  private attachmentService = inject(TicketAttachmentService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  attachmentUrl = this.attachmentService.attachmentUrl;
  attachmentLoading = this.attachmentService.loading;

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

  deleting = signal(false);
  timelineExpanded = signal(false);

  canEdit = computed(() => {
    const stateCode = this.state()?.code;
    return stateCode === 'open';
  });

  isTerminalState = computed(() => {
    const code = this.state()?.code;
    return code === 'finished' || code === 'error' || code === 'cancelled';
  });

  unreadCount = computed(() =>
    this.ticketService.pendingComments().filter((c) => c.ticket_id === this.ticket()?.id).length,
  );

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

    // GESTIONAR LA URL DE ARCHIVO
    effect(() => {
      const voucherRequest = this.ticket()?.voucherRequest;
      if (!voucherRequest?.id) {
        this.attachmentService.attachmentUrl.set(null);
        return;
      }
      this.attachmentService.loadAttachment(voucherRequest.id);
    });
  }

  private cargarHistorial(ticketId: number): void {
    this.historyService.getByTicketId(ticketId).subscribe({
      next: (history) => this.ticketHistory.set(history),
    });
  }

  openChat(): void {
    this.router.navigate(['/panel/solicitud', this.code(), 'chat']);
  }

  getStateBadgeClass(stateCode?: string): string {
    const map: Record<string, string> = {
      open: 'badge-open',
      started: 'badge-open',
      waiting: 'badge-review',
      finished: 'badge-closed',
      error: 'badge-closed',
      cancelled: 'badge-closed',
    };
    return map[stateCode ?? ''] ?? 'badge-open';
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

  confirmDelete(): void {
    const ref = this.dialog.open(ConfirmDeleteDialog, {
      width: '320px',
      data: { code: this.ticket()?.code },
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.deleting.set(true);
      const id = this.ticket()!.id;
      this.ticketService.deleteTicket(id).subscribe({
        next: () => {
          this.ticketService.loadData();
          this.router.navigate(['/panel/mis-solicitudes']);
        },
        error: () => {
          this.deleting.set(false);
        },
      });
    });
  }
}
