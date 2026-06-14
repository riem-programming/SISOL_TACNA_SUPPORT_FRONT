import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { first, Subject, takeUntil } from 'rxjs';
import { VoucherActionType } from '../models/voucherActionType.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VoucherActionTypeService {
  private readonly baseUrl = `${environment.apiUrl}/voucher-action-type`;
  private http = inject(HttpClient);
  readonly loading = signal(false);
  private onDestroy = new Subject<void>();
  private state = signal({ voucherActionType: new Map<number, VoucherActionType>() });

  constructor() {
    this.loadData();
  }

  loadData() {
    this.onDestroy.next();
    this.loading.set(true);
    this.http
      .get<VoucherActionType[]>(this.baseUrl)
      .pipe(takeUntil(this.onDestroy), first())
      .subscribe({
        next: (response: VoucherActionType[]) => {
          if (response.length === 0) {
            this.state.set({ voucherActionType: new Map() });
            this.loading.set(false);
            return;
          }
          this.updateList(response);
          this.loading.set(false);
        },
        error: (_) => {
          this.state.set({ voucherActionType: new Map() });
          this.loading.set(false);
        },
      });
  }

  getAll(): VoucherActionType[] {
    return Array.from(this.state().voucherActionType.values());
  }

  getById(id: number): VoucherActionType | undefined {
    return this.state().voucherActionType.get(id);
  }

  private updateList(data: VoucherActionType[]) {
    const map = new Map<number, VoucherActionType>();
    for (const item of data) {
      map.set(item.id, item);
    }
    this.state.set({ voucherActionType: map });
  }
}
