import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { first, Subject, takeUntil } from 'rxjs';
import { SystemRole } from '../models/systemRole.model';

@Injectable({
  providedIn: 'root',
})
export class SystemRoleService {
  private readonly baseUrl = 'http://localhost:3000/system-role';
  private http = inject(HttpClient);
  readonly loading = signal(false);
  private onDestroy = new Subject<void>();
  private state = signal({ systemRole: new Map<number, SystemRole>() });

  constructor() {
    this.loadData();
  }

  loadData() {
    this.onDestroy.next();
    this.loading.set(true);
    this.http
      .get<SystemRole[]>(this.baseUrl)
      .pipe(takeUntil(this.onDestroy), first())
      .subscribe({
        next: (response: SystemRole[]) => {
          if (response.length === 0) {
            this.state.set({ systemRole: new Map() });
            this.loading.set(false);
            return;
          }
          this.updateList(response);
          this.loading.set(false);
        },
        error: (_) => {
          this.state.set({ systemRole: new Map() });
          this.loading.set(false);
        },
      });
  }

  getAll(): SystemRole[] {
    return Array.from(this.state().systemRole.values());
  }

  getById(id: number): SystemRole | undefined {
    return this.state().systemRole.get(id);
  }

  private updateList(data: SystemRole[]) {
    const map = new Map<number, SystemRole>();
    for (const item of data) {
      map.set(item.id, item);
    }
    this.state.set({ systemRole: map });
  }
}
