import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StateTicket } from '../../../../../../core/models/stateTicket.model';

// Canonical ticket lifecycle order; catalog states are sorted against this
const STATE_FLOW = ['pending', 'open', 'review', 'closed'];

type StepStatus = 'done' | 'current' | 'upcoming';

interface TimelineStep {
  code: string;
  name: string;
  status: StepStatus;
}

@Component({
  selector: 'app-status-timeline',
  imports: [MatIconModule],
  templateUrl: './status-timeline.html',
  styleUrl: './status-timeline.css',
})
export class StatusTimeline {
  states = input.required<StateTicket[]>();
  currentStateId = input.required<number>();

  steps = computed<TimelineStep[]>(() => {
    const catalog = this.states();
    const ordered = STATE_FLOW.map((code) => catalog.find((s) => s.code === code)).filter(
      (s): s is StateTicket => s !== undefined,
    );
    const currentIndex = ordered.findIndex((s) => s.id === this.currentStateId());

    return ordered.map((s, i) => ({
      code: s.code,
      name: s.name,
      status:
        currentIndex === -1
          ? 'upcoming'
          : i < currentIndex
            ? 'done'
            : i === currentIndex
              ? 'current'
              : 'upcoming',
    }));
  });
}
