import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { HistoryTicketState } from '../../../../../../core/models/historyTicketState.model';

type StepStatus = 'done' | 'current' | 'terminal';

interface TimelineStep {
  code: string;
  name: string;
  status: StepStatus;
  date: Date;
}

@Component({
  selector: 'app-status-timeline',
  imports: [MatIconModule],
  templateUrl: './status-timeline.html',
  styleUrl: './status-timeline.css',
})
export class StatusTimeline {
  history = input.required<HistoryTicketState[]>();

  steps = computed<TimelineStep[]>(() => {
    const history = this.history();
    if (!history.length) return [];

    // Garantiza orden cronológico tal cual ocurrieron
    const sorted = [...history].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return sorted.map((entry, i) => {
      const isLast = i === sorted.length - 1;
      const status: StepStatus = !isLast
        ? 'done'
        : entry.state.is_terminal
          ? 'terminal'
          : 'current';

      return {
        code: entry.state.code,
        name: entry.state.name,
        status,
        date: entry.createdAt,
      };
    });
  });
}
