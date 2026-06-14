import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { RequestType } from '../models/requestType.model';
import { first, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RequestTypeService {
  private readonly baseUrl = `${environment.apiUrl}/request-type`;
  private http = inject(HttpClient);
  readonly loading = signal(false);
  private onDestroy = new Subject<void>();
  private state = signal({ requestType: new Map<number, RequestType>() });

  constructor() {
    this.loadData();
  }

  loadData() {
    this.onDestroy.next();
    this.loading.set(true);
    this.http
      .get<RequestType[]>(this.baseUrl)
      .pipe(takeUntil(this.onDestroy), first())
      .subscribe({
        next: (response: RequestType[]) => {
          if (response.length === 0) {
            this.state.set({ requestType: new Map() });
            this.loading.set(false);
            return;
          }
          this.updateList(response);
          this.loading.set(false);
        },
        error: (_) => {
          this.state.set({ requestType: new Map() });
          this.loading.set(false);
        },
      });
  }

  getAll(): RequestType[] {
    return Array.from(this.state().requestType.values());
  }

  getById(id: number): RequestType | undefined {
    return this.state().requestType.get(id);
  }

  private updateList(data: RequestType[]) {
    const map = new Map<number, RequestType>();
    for (const item of data) {
      map.set(item.id, item);
    }
    this.state.set({ requestType: map });
  }
}
