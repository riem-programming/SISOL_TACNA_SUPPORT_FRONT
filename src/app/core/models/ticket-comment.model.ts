export interface TicketComment {
  id: number;
  ticket_id: number;
  user_id: number | null;
  author_type: 'user' | 'admin' | 'system';
  message: string;
  read_at?: string | null;
  created_at: string;
  user?: { id: number; username: string };
}
