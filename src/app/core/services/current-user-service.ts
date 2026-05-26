import { Injectable, signal } from '@angular/core';
import { User } from '../../features/user/model/user.model';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  user = signal<User | null>(null);
}
