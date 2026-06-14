import { inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { AdminTicket } from '../models/admin-ticket.model';
import { TicketComment } from '../../../core/models/ticket-comment.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminSseService implements OnDestroy {
  private abortController: AbortController | null = null;
  private zone = inject(NgZone);

  readonly newTicket$ = new Subject<AdminTicket>();
  readonly deletedTicketId$ = new Subject<number>();
  readonly newComment$ = new Subject<TicketComment>();
  readonly messagesRead$ = new Subject<number>();

  connect(): void {
    if (this.abortController) return;
    const key = sessionStorage.getItem('admin_key') ?? '';
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    fetch(`${environment.apiUrl}/ticket/admin/events`, {
      headers: { 'x-admin-key': key },
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
            setTimeout(() => this.connect(), 3000);
            return;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            try {
              const payload = JSON.parse(line.slice(5).trim());
              this.zone.run(() => this.dispatch(payload));
            } catch {}
          }
          read();
        }).catch(() => {
          if (!signal.aborted) {
            this.abortController = null;
            setTimeout(() => this.connect(), 3000);
          }
        });

      read();
    }).catch(() => {
      if (!signal.aborted) {
        this.abortController = null;
        setTimeout(() => this.connect(), 3000);
      }
    });
  }

  private dispatch(payload: any): void {
    if (payload.type === 'ping') return;
    if (payload.type === 'new_ticket') this.newTicket$.next(payload.ticket);
    else if (payload.type === 'deleted_ticket') this.deletedTicketId$.next(payload.ticket_id);
    else if (payload.type === 'new_comment') this.newComment$.next(payload.comment);
    else if (payload.type === 'messages_read') this.messagesRead$.next(payload.ticket_id);
  }

  disconnect(): void {
    this.abortController?.abort();
    this.abortController = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
