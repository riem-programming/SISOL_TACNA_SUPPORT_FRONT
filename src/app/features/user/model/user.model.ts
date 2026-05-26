export interface User {
  id: number;
  username: string;
  password: string;
  must_change_password: boolean;
  email: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}
