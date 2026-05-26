import { User } from '../../user/model/user.model';

export interface AuthResponse {
  access_token: string;
  user: User | null;
}
