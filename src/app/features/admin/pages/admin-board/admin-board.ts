import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, first, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { AdminService } from '../../services/admin-service';
import { StateTicketService } from '../../../../core/services/state-ticket-service';
import { AdminTicket } from '../../models/admin-ticket.model';
import { StateTicket } from '../../../../core/models/stateTicket.model';
import { TicketCard } from '../../components/ticket-card/ticket-card';
import { TicketDetailModal } from '../../components/ticket-detail-modal/ticket-detail-modal';

interface Column {
  state: StateTicket;
  tickets: AdminTicket[];
}

@Component({
  selector: 'app-admin-board',
  imports: [
    DragDropModule,
    CdkScrollable,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatMenuModule,
    TicketCard,
  ],
  templateUrl: './admin-board.html',
  styleUrl: './admin-board.css',
})
export default class AdminBoard implements OnInit {
  private adminService = inject(AdminService);
  private stateService = inject(StateTicketService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  private readonly statesReady$ = toObservable(this.stateService.loading).pipe(
    filter((loading) => !loading),
    first(),
  );

  loading = signal(true);
  error = signal(false);
  cleaning = signal<string | null>(null);
  columns: Column[] = [];

  get columnIds(): string[] {
    return this.columns.map((c) => `col-${c.state.id}`);
  }

  ngOnInit() {
    this.loadBoard();
  }

  loadBoard() {
    this.loading.set(true);
    this.error.set(false);

    this.statesReady$
      .pipe(
        switchMap(() => this.adminService.getAllTickets()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (tickets) => {
          const states = this.stateService
            .getAll()
            .filter((s) => s.is_active)
            .sort((a, b) => {
              if (a.flow_order === null && b.flow_order === null) return 0;
              if (a.flow_order === null) return 1;
              if (b.flow_order === null) return -1;
              return a.flow_order - b.flow_order;
            });

          this.columns = states.map((state) => ({
            state,
            tickets: tickets.filter((t) => t.state_id === state.id),
          }));

          this.loading.set(false);
          this.cdr.detectChanges();
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  onDrop(event: CdkDragDrop<AdminTicket[]>, targetCol: Column) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const ticket = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      ticket.state_id = targetCol.state.id;
      ticket.state = targetCol.state;
      this.adminService.updateTicketState(ticket.id, targetCol.state.id).subscribe({
        error: () => this.loadBoard(),
      });
    }
  }

  openDetail(ticket: AdminTicket) {
    this.dialog
      .open(TicketDetailModal, {
        data: ticket,
        maxWidth: '640px',
        width: '95vw',
        panelClass: 'ticket-detail-dialog',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.stateChanged) this.loadBoard();
      });
  }

  cleanByState(code: string, label: string) {
    const confirmed = window.confirm(
      `¿Eliminar todos los tickets con estado "${label}"?\nEsta acción es permanente y no se puede deshacer.`,
    );
    if (!confirmed) return;

    this.cleaning.set(code);
    this.adminService.cleanTicketsByState(code).subscribe({
      next: ({ deleted }) => {
        this.cleaning.set(null);
        if (deleted > 0) this.loadBoard();
      },
      error: () => this.cleaning.set(null),
    });
  }

  logout() {
    sessionStorage.removeItem('admin_verified');
    sessionStorage.removeItem('admin_key');
    this.router.navigate(['/']);
  }
}
