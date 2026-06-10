import { Component, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminTicket } from '../../models/admin-ticket.model';
import { AdminService } from '../../services/admin-service';
import { StateTicketService } from '../../../../core/services/state-ticket-service';
import { StateTicket } from '../../../../core/models/stateTicket.model';

@Component({
  selector: 'app-ticket-detail-modal',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    JsonPipe,
  ],
  templateUrl: './ticket-detail-modal.html',
  styleUrl: './ticket-detail-modal.css',
})
export class TicketDetailModal {
  ticket = inject<AdminTicket>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<TicketDetailModal>);
  private adminService = inject(AdminService);
  private stateService = inject(StateTicketService);

  readonly states: StateTicket[] = this.stateService
    .getAll()
    .filter((s) => s.is_active)
    .sort((a, b) => {
      if (a.flow_order === null && b.flow_order === null) return 0;
      if (a.flow_order === null) return 1;
      if (b.flow_order === null) return -1;
      return a.flow_order - b.flow_order;
    });

  moving = signal(false);
  attachmentLoading = signal(false);

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

  getPriorityColor(code?: string): string {
    const map: Record<string, string> = {
      low: '#43a047',
      medium: '#fb8c00',
      high: '#ef5350',
    };
    return map[code ?? ''] ?? '#9e9e9e';
  }

  moveToState(state: StateTicket) {
    if (state.id === this.ticket.state_id || this.moving()) return;
    this.moving.set(true);
    this.adminService.updateTicketState(this.ticket.id, state.id).subscribe({
      next: () => this.dialogRef.close({ stateChanged: true }),
      error: () => this.moving.set(false),
    });
  }

  openAttachment() {
    const voucherId = this.ticket.voucherRequest?.id;
    if (!voucherId) return;
    this.attachmentLoading.set(true);
    this.adminService.getAttachmentUrl(voucherId).subscribe({
      next: ({ url }) => {
        window.open(url, '_blank', 'noopener');
        this.attachmentLoading.set(false);
      },
      error: () => this.attachmentLoading.set(false),
    });
  }
}
