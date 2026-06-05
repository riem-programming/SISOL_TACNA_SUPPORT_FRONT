import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { User } from '../../features/user/model/user.model';
import { JwtPayload } from '../models/jwtPayload.model';
import { jwtDecode } from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from '../../features/user/services/user-service';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  user = signal<User | null>(null);
  private platformId = inject(PLATFORM_ID);
  private userService = inject(UserService);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const payload = this.getDecodedToken();
      this.userService.getUserById(Number(payload?.sub)).subscribe((result) => {
        if (result.error) {
          localStorage.clear();
          return;
        }
        this.user.set(result.data);
      });
    }
  }

  // Single place to drop the session: used by logout and by the
  // 401 interceptor when the JWT expires
  clearSession() {
    this.user.set(null);
    if (isPlatformBrowser(this.platformId)) {
      // Remove only our key — clear() would wipe unrelated storage
      localStorage.removeItem('access_token');
    }
  }

  getDecodedToken(): JwtPayload | null {
    const token = localStorage.getItem('access_token');

    if (!token) return null;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }
}
