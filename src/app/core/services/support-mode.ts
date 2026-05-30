import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { first, Subject, takeUntil } from 'rxjs';
import { SupportMode } from '../models/supportMode.model';

@Injectable({
  providedIn: 'root',
})
export class SupportModeService {
  private readonly baseUrl = 'http://localhost:3000/support-mode';
  private http = inject(HttpClient);
  readonly loading = signal(false);
  private onDestroy = new Subject<void>();
  private state = signal({ supportMode: new Map<number, SupportMode>() });

  constructor() {
    this.loadData();
  }

  loadData() {
    this.onDestroy.next();
    this.loading.set(true);
    this.http
      .get<SupportMode[]>(this.baseUrl)
      .pipe(takeUntil(this.onDestroy), first())
      .subscribe({
        next: (response: SupportMode[]) => {
          if (response.length === 0) {
            this.state.set({ supportMode: new Map() });
            this.loading.set(false);
            return;
          }
          this.updateList(response);
          this.loading.set(false);
        },
        error: (_) => {
          this.state.set({ supportMode: new Map() });
          this.loading.set(false);
        },
      });
  }

  getAll(): SupportMode[] {
    return Array.from(this.state().supportMode.values());
  }

  getById(id: number): SupportMode | undefined {
    return this.state().supportMode.get(id);
  }

  private updateList(data: SupportMode[]) {
    const map = new Map<number, SupportMode>();
    for (const item of data) {
      map.set(item.id, item);
    }
    this.state.set({ supportMode: map });
  }
}
