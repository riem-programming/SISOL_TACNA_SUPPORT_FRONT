import {
  Component,
  ElementRef,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TicketService } from '../../../../core/services/ticket-service';
import { RequestTypeService } from '../../../../core/services/request-type-service';
import { TicketComment } from '../../../../core/models/ticket-comment.model';

@Component({
  selector: 'app-user-ticket-chat',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './user-ticket-chat.html',
  styleUrl: './user-ticket-chat.css',
})
export default class UserTicketChat {
  private ticketService = inject(TicketService);
  private requestTypeService = inject(RequestTypeService);
  private location = inject(Location);

  @ViewChild('threadRef') private threadRef?: ElementRef<HTMLElement>;
  @ViewChild('chatInput') private chatInputRef?: ElementRef<HTMLTextAreaElement>;

  code = input.required<string>();

  ticket = computed(() => this.ticketService.getByCode(this.code()));
  requestType = computed(() => {
    const t = this.ticket();
    return t ? this.requestTypeService.getById(t.request_type_id) : undefined;
  });

  comments = signal<TicketComment[]>([]);
  sending = signal(false);
  inputValue = '';

  constructor() {
    effect(
      () => {
        const ticketId = this.ticket()?.id;
        if (!ticketId) return;
        this.ticketService.getComments(ticketId).subscribe({
          next: (comments) => {
            this.comments.set(comments);
            this.scheduleScroll('force');
            untracked(() =>
              this.ticketService.markUserRead(ticketId).subscribe({ error: () => {} }),
            );
          },
        });
      },
      { allowSignalWrites: true },
    );

    effect(
      () => {
        const incoming = this.ticketService.pendingComments();
        if (!incoming.length) return;
        const ticketId = this.ticket()?.id;
        if (!ticketId) return;
        const relevant = incoming.filter((c) => c.ticket_id === ticketId);
        if (!relevant.length) return;
        const wasNearBottom = this.isNearBottom();
        this.comments.update((prev) => [...prev, ...relevant]);
        this.ticketService.pendingComments.update((all) =>
          all.filter((c) => c.ticket_id !== ticketId),
        );
        if (wasNearBottom) this.scheduleScroll('force');
        untracked(() =>
          this.ticketService.markUserRead(ticketId).subscribe({ error: () => {} }),
        );
      },
      { allowSignalWrites: true },
    );

    effect(
      () => {
        const receipts = this.ticketService.pendingReadReceipts();
        const ticketId = this.ticket()?.id;
        if (!ticketId || !receipts.length) return;
        const relevant = receipts.some((r) => r.ticket_id === ticketId);
        if (!relevant) return;
        const now = new Date().toISOString();
        this.comments.update((prev) =>
          prev.map((c) => (c.author_type === 'user' && !c.read_at ? { ...c, read_at: now } : c)),
        );
        this.ticketService.pendingReadReceipts.update((all) =>
          all.filter((r) => r.ticket_id !== ticketId),
        );
      },
      { allowSignalWrites: true },
    );
  }

  goBack(): void {
    this.location.back();
  }

  onInput(event: Event): void {
    this.inputValue = (event.target as HTMLTextAreaElement).value;
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  send(): void {
    const message = this.inputValue.trim();
    const ticketId = this.ticket()?.id;
    if (!message || !ticketId || this.sending()) return;
    this.sending.set(true);
    this.ticketService.sendComment(ticketId, message).subscribe({
      next: (comment) => {
        this.comments.update((prev) => [...prev, comment]);
        this.inputValue = '';
        if (this.chatInputRef) this.chatInputRef.nativeElement.value = '';
        this.sending.set(false);
        this.scheduleScroll('force');
      },
      error: () => this.sending.set(false),
    });
  }

  formatTime(value: string): string {
    return new Date(value).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private scheduleScroll(mode: 'force' | 'smart'): void {
    const atBottom = mode === 'force' || this.isNearBottom();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (atBottom) this.scrollToBottom();
      });
    });
  }

  private isNearBottom(): boolean {
    const el = this.threadRef?.nativeElement;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  private scrollToBottom(): void {
    const el = this.threadRef?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
