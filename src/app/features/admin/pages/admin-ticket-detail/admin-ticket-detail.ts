import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminTicket } from '../../models/admin-ticket.model';
import { AdminService } from '../../services/admin-service';
import { StateTicketService } from '../../../../core/services/state-ticket-service';
import { StateTicket } from '../../../../core/models/stateTicket.model';
import { TicketComment } from '../../../../core/models/ticket-comment.model';

@Component({
  selector: 'app-admin-ticket-detail',
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    JsonPipe,
  ],
  templateUrl: './admin-ticket-detail.html',
  styleUrl: './admin-ticket-detail.css',
})
export default class AdminTicketDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private router = inject(Router);
  private adminService = inject(AdminService);
  private stateService = inject(StateTicketService);

  ticket = signal<AdminTicket | null>(null);
  loading = signal(true);

  readonly states = computed(() =>
    this.stateService
      .getAll()
      .filter((s) => s.is_active)
      .sort((a, b) => {
        if (a.flow_order === null && b.flow_order === null) return 0;
        if (a.flow_order === null) return 1;
        if (b.flow_order === null) return -1;
        return a.flow_order - b.flow_order;
      })
  );

  moving = signal(false);
  attachmentLoading = signal(false);
  comments = signal<TicketComment[]>([]);
  unreadCount = signal(0);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.adminService.getTicketById(id).subscribe({
      next: (ticket) => {
        this.ticket.set(ticket);
        this.loading.set(false);
        this.adminService.getAdminComments(id).subscribe({
          next: (comments) => {
            this.comments.set(comments);
            const unread = comments.filter(c => c.author_type === 'user' && !c.read_at).length;
            this.unreadCount.set(unread);
          },
        });
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.location.back();
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

  getPriorityColor(code?: string): string {
    const map: Record<string, string> = {
      low: '#43a047',
      medium: '#fb8c00',
      high: '#ef5350',
    };
    return map[code ?? ''] ?? '#9e9e9e';
  }

  moveToState(state: StateTicket): void {
    const ticket = this.ticket();
    if (!ticket || state.id === ticket.state_id || this.moving()) return;
    this.moving.set(true);
    this.adminService.updateTicketState(ticket.id, state.id).subscribe({
      next: () => this.goBack(),
      error: () => this.moving.set(false),
    });
  }

  openAttachment(): void {
    const ticket = this.ticket();
    const voucherId = ticket?.voucherRequest?.id;
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

  openChat(): void {
    const ticket = this.ticket();
    if (!ticket) return;
    this.router.navigate(['admin/ticket', ticket.id, 'chat']);
  }
}
