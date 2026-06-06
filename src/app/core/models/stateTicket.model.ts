export interface StateTicket {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  flow_order: number | null;
  is_terminal: boolean;
  createdAt: Date;
  updateddAt: Date;
}
