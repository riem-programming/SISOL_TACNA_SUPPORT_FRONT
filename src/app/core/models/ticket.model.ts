export interface Ticket {
  id: number;
  code: string;
  state_id: number;
  request_type_id: number;
  priority_id: number;
  user_id: number;
  is_active: boolean;
  createdAt: Date;
  updateddAt: Date;
}
