import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TicketComment } from '../../../core/models/ticket-comment.model';

@Component({
  selector: 'app-ticket-comments',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './ticket-comments.html',
  styleUrl: './ticket-comments.css',
})
export class TicketComments {
  @Input() comments: TicketComment[] = [];
  @Input() currentAuthorType: 'user' | 'admin' = 'user';
  @Input() sending = false;
  @Output() sendMessage = new EventEmitter<string>();

  @ViewChild('scrollAnchor') private scrollAnchor!: ElementRef<HTMLElement>;

  messageText = signal('');

  submit(): void {
    const text = this.messageText().trim();
    if (!text || this.sending) return;
    this.sendMessage.emit(text);
    this.messageText.set('');
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }

  private scrollToBottom(): void {
    this.scrollAnchor?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
  }

  isOwn(comment: TicketComment): boolean {
    return comment.author_type === this.currentAuthorType;
  }

  formatTime(value: string): string {
    return new Date(value).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
