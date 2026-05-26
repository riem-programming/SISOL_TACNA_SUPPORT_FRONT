import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, Observable, of } from 'rxjs';
import { ApiResult } from '../../../core/models/apiResult.model';
import { AuthResponse } from '../model/auth.model';
import { ErrorResponse } from '../../../core/models/error.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:3000/user';
  private http = inject(HttpClient);
  loading = signal<boolean>(false);

  login(username: string, password: string): Observable<ApiResult<AuthResponse, ErrorResponse>> {
    this.loading.set(true);

    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { username, password }).pipe(
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

      finalize(() => this.loading.set(false)),
    );
  }

  create(username: string, password: string, email: string | undefined) {
    this.loading.set(true);

    return this.http.post(this.baseUrl, { username, password, email }).pipe(
      map((response) => ({
        data: response,
        error: null,
      })),

      catchError((error: HttpErrorResponse) =>
        of({
          data: null,
          error: error.error,
        }),
      ),

      finalize(() => this.loading.set(false)),
    );
  }

  verifySession() {
    this.loading.set(true);

    return this.http.get(`${this.baseUrl}/verify-session`).pipe(
      map((_) => true),

      catchError((_: HttpErrorResponse) => of(false)),

      finalize(() => this.loading.set(false)),
    );
  }
}
