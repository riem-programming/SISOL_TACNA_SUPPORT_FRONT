import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { AdminTicket } from '../models/admin-ticket.model';
import { TicketComment } from '../../../core/models/ticket-comment.model';

@Injectable({ providedIn: 'root' })
export class AdminSseService implements OnDestroy {
  private eventSource: EventSource | null = null;

  readonly newTicket$ = new Subject<AdminTicket>();
  readonly deletedTicketId$ = new Subject<number>();
  readonly newComment$ = new Subject<TicketComment>();
  readonly messagesRead$ = new Subject<number>();

  connect(): void {
    if (this.eventSource) return;
    const key = sessionStorage.getItem('admin_key') ?? '';
    this.eventSource = new EventSource(
      `http://localhost:3000/ticket/admin/events?key=${encodeURIComponent(key)}`,
    );
    this.eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'new_ticket') {
        this.newTicket$.next(payload.ticket);
      } else if (payload.type === 'deleted_ticket') {
        this.deletedTicketId$.next(payload.ticket_id);
      } else if (payload.type === 'new_comment') {
        this.newComment$.next(payload.comment);
      } else if (payload.type === 'messages_read') {
        this.messagesRead$.next(payload.ticket_id);
      }
    };
  }

  disconnect(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
