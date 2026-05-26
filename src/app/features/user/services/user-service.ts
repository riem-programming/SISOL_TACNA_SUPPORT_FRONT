import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, of } from 'rxjs';
import { ErrorResponse } from '../../../core/models/error.model';
import { User } from '../model/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly baseUrl = 'http://localhost:3000/user';
  private http = inject(HttpClient);
  loadingGetById = signal<boolean>(false);

  getUserById(id: number) {
    this.loadingGetById.set(true);

    return this.http.get<User>(`${this.baseUrl}/${id}`).pipe(
      map((response) => ({
        data: response,
        error: null,
      })),

      catchError((error: HttpErrorResponse) =>
        of({
          data: null,
          error: error.error as ErrorResponse,
        }),
      ),

      finalize(() => this.loadingGetById.set(false)),
    );
  }
}
