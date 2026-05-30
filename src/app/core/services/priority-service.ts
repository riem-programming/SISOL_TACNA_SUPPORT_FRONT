import { inject, Injectable, signal } from '@angular/core';
import { Priority } from '../models/priority.model';
import { first, Subject, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PriorityService {
  private readonly baseUrl = 'http://localhost:3000/priority';
  private http = inject(HttpClient);
  readonly loading = signal(false);
  private onDestroy = new Subject<void>();
  private state = signal({ priority: new Map<number, Priority>() });

  constructor() {
    this.loadData();
  }

  loadData() {
    this.onDestroy.next();
    this.loading.set(true);
    this.http
      .get<Priority[]>(this.baseUrl)
      .pipe(takeUntil(this.onDestroy), first())
      .subscribe({
        next: (response: Priority[]) => {
          if (response.length === 0) {
            this.state.set({ priority: new Map() });
            this.loading.set(false);
            return;
          }
          this.updateList(response);
          this.loading.set(false);
        },
        error: (_) => {
          this.state.set({ priority: new Map() });
          this.loading.set(false);
        },
      });
  }

  getAll(): Priority[] {
    return Array.from(this.state().priority.values());
  }

  getById(id: number): Priority | undefined {
    return this.state().priority.get(id);
  }

  private updateList(data: Priority[]) {
    const map = new Map<number, Priority>();
    for (const item of data) {
      map.set(item.id, item);
    }
    this.state.set({ priority: map });
  }
}
