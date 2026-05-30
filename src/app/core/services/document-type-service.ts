import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { first, Subject, takeUntil } from 'rxjs';
import { DocumentType } from '../models/documentType.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentTypeService {
  private readonly baseUrl = 'http://localhost:3000/document-type';
  private http = inject(HttpClient);
  readonly loading = signal(false);
  private onDestroy = new Subject<void>();
  private state = signal({ documentType: new Map<number, DocumentType>() });

  constructor() {
    this.loadData();
  }

  loadData() {
    this.onDestroy.next();
    this.loading.set(true);
    this.http
      .get<DocumentType[]>(this.baseUrl)
      .pipe(takeUntil(this.onDestroy), first())
      .subscribe({
        next: (response: DocumentType[]) => {
          if (response.length === 0) {
            this.state.set({ documentType: new Map() });
            this.loading.set(false);
            return;
          }
          this.updateList(response);
          this.loading.set(false);
        },
        error: (_) => {
          this.state.set({ documentType: new Map() });
          this.loading.set(false);
        },
      });
  }

  getAll(): DocumentType[] {
    return Array.from(this.state().documentType.values());
  }

  getById(id: number): DocumentType | undefined {
    return this.state().documentType.get(id);
  }

  private updateList(data: DocumentType[]) {
    const map = new Map<number, DocumentType>();
    for (const item of data) {
      map.set(item.id, item);
    }
    this.state.set({ documentType: map });
  }
}
