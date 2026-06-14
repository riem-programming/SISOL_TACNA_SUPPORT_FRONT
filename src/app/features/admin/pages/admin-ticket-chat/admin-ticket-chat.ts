import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../services/admin-service';
import { AdminSseService } from '../../services/admin-sse-service';
import { TicketComment } from '../../../../core/models/ticket-comment.model';

@Component({
  selector: 'app-admin-ticket-chat',
  imports: [MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './admin-ticket-chat.html',
  styleUrl: './admin-ticket-chat.css',
})
export default class AdminTicketChat implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private router = inject(Router);
  private adminService = inject(AdminService);
  private sseService = inject(AdminSseService);

  @ViewChild('threadRef') private threadRef?: ElementRef<HTMLElement>;

  ticketId = signal(0);
  ticketCode = signal('');
  comments = signal<TicketComment[]>([]);
  loading = signal(true);
  sending = signal(false);
  inputValue = '';
  private sseSub?: Subscription;
  private readSub?: Subscription;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.ticketId.set(id);

    this.adminService.getTicketById(id).subscribe({
      next: (ticket) => this.ticketCode.set(ticket.code),
    });

    this.adminService.getAdminComments(id).subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.loading.set(false);
        this.scheduleScroll('force');
        this.adminService.markAdminRead(id).subscribe({ error: () => {} });
      },
      error: () => this.loading.set(false),
    });

    this.sseService.connect();
    this.sseSub = this.sseService.newComment$.subscribe((comment) => {
      if (comment.ticket_id !== id) return;
      const wasNearBottom = this.isNearBottom();
      this.comments.update((prev) => [...prev, comment]);
      if (wasNearBottom) this.scheduleScroll('force');
      this.adminService.markAdminRead(id).subscribe({ error: () => {} });
    });

    this.readSub = this.sseService.messagesRead$.subscribe((ticketId) => {
      if (ticketId !== id) return;
      const now = new Date().toISOString();
      this.comments.update((prev) =>
        prev.map((c) => (c.author_type === 'admin' && !c.read_at ? { ...c, read_at: now } : c)),
      );
    });
  }

  ngOnDestroy(): void {
    this.sseSub?.unsubscribe();
    this.readSub?.unsubscribe();
  }

  goBack(): void {
    const navId = (window.history.state as { navigationId?: number })?.navigationId;
    if (navId && navId > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/admin/ticket', this.ticketId()]);
    }
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
    if (!message || this.sending()) return;
    this.sending.set(true);
    this.adminService.sendAdminComment(this.ticketId(), message).subscribe({
      next: (comment) => {
        this.comments.update((prev) => [...prev, comment]);
        this.inputValue = '';
        const textarea = this.threadRef?.nativeElement
          .closest('.chat-page')
          ?.querySelector('textarea') as HTMLTextAreaElement | null;
        if (textarea) textarea.value = '';
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
