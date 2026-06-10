import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AdminTicket } from '../../models/admin-ticket.model';

@Component({
  selector: 'app-ticket-card',
  imports: [MatIconModule],
  templateUrl: './ticket-card.html',
  styleUrl: './ticket-card.css',
})
export class TicketCard {
  ticket = input.required<AdminTicket>();
  cardClick = output<void>();

  formatDate(value: Date): string {
    const date = new Date(value);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    if (date >= startOfToday) {
      return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    if (date >= startOfYesterday) return 'Ayer';
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  }

  getPriorityColor(code?: string): string {
    const map: Record<string, string> = {
      low: '#43a047',
      medium: '#fb8c00',
      high: '#ef5350',
    };
    return map[code ?? ''] ?? '#9e9e9e';
  }
}
