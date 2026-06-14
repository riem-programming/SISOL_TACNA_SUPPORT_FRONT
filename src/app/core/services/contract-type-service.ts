import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { first, Subject, takeUntil } from 'rxjs';
import { ContractType } from '../models/contractType.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ContractTypeService {
  private readonly baseUrl = `${environment.apiUrl}/contract-type`;
  private http = inject(HttpClient);
  readonly loading = signal(false);
  private onDestroy = new Subject<void>();
  private state = signal({ contractType: new Map<number, ContractType>() });

  constructor() {
    this.loadData();
  }

  loadData() {
    this.onDestroy.next();
    this.loading.set(true);
    this.http
      .get<ContractType[]>(this.baseUrl)
      .pipe(takeUntil(this.onDestroy), first())
      .subscribe({
        next: (response: ContractType[]) => {
          if (response.length === 0) {
            this.state.set({ contractType: new Map() });
            this.loading.set(false);
            return;
          }
          this.updateList(response);
          this.loading.set(false);
        },
        error: (_) => {
          this.state.set({ contractType: new Map() });
          this.loading.set(false);
        },
      });
  }

  getAll(): ContractType[] {
    return Array.from(this.state().contractType.values());
  }

  getById(id: number): ContractType | undefined {
    return this.state().contractType.get(id);
  }

  private updateList(data: ContractType[]) {
    const map = new Map<number, ContractType>();
    for (const item of data) {
      map.set(item.id, item);
    }
    this.state.set({ contractType: map });
  }
}
