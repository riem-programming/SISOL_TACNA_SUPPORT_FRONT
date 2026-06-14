import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ResponseAttachment {
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class TicketAttachmentService {
  private readonly baseUrl = `${environment.apiUrl}/voucher-request`;
  private http = inject(HttpClient);

  readonly loading = signal(false);
  readonly attachmentUrl = signal<string | null>(null);

  getAttachmentUrl(voucherRequestId: number): Observable<ResponseAttachment | null> {
    return this.http
      .get<ResponseAttachment>(`${this.baseUrl}/${voucherRequestId}/attachment`)
      .pipe(catchError(() => of(null)));
  }

  loadAttachment(voucherRequestId: number): void {
    this.loading.set(true);
    this.attachmentUrl.set(null);

    this.getAttachmentUrl(voucherRequestId).subscribe({
      next: (response) => {
        this.attachmentUrl.set(response?.url ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.attachmentUrl.set(null);
        this.loading.set(false);
      },
    });
  }
}
