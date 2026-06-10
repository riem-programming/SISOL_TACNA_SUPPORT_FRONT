export interface TicketComment {
  id: number;
  ticket_id: number;
  user_id: number | null;
  author_type: 'user' | 'admin';
  message: string;
  created_at: string;
  user?: { id: number; username: string };
}
