import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AdminTicket } from '../models/admin-ticket.model';
import { TicketComment } from '../../../core/models/ticket-comment.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}`;

  private adminHeaders() {
    return { 'x-admin-key': localStorage.getItem('admin_key') ?? '' };
  }

  verifyKey(key: string) {
    return this.http.post<{ valid: boolean }>(`${this.baseUrl}/admin/verify`, { key });
  }

  getAllTickets() {
    return this.http.get<AdminTicket[]>(`${this.baseUrl}/ticket/admin/all`, {
      headers: this.adminHeaders(),
    });
  }

  getTicketById(id: number) {
    return this.http.get<AdminTicket>(`${this.baseUrl}/ticket/admin/${id}`, {
      headers: this.adminHeaders(),
    });
  }

  updateTicketState(ticketId: number, stateId: number) {
    return this.http.patch(`${this.baseUrl}/ticket/${ticketId}/state`, { state_id: stateId }, {
      headers: this.adminHeaders(),
    });
  }

  getAttachmentUrl(voucherRequestId: number) {
    return this.http.get<{ url: string }>(
      `${this.baseUrl}/voucher-request/${voucherRequestId}/attachment`,
      { headers: this.adminHeaders() },
    );
  }

  cleanTicketsByState(stateCode: string) {
    return this.http.delete<{ deleted: number }>(
      `${this.baseUrl}/ticket/admin/clean/${stateCode}`,
      { headers: this.adminHeaders() },
    );
  }

  getAdminComments(ticketId: number) {
    return this.http.get<TicketComment[]>(
      `${this.baseUrl}/ticket-comment/admin/${ticketId}`,
      { headers: this.adminHeaders() },
    );
  }

  sendAdminComment(ticketId: number, message: string) {
    return this.http.post<TicketComment>(
      `${this.baseUrl}/ticket-comment/admin`,
      { ticket_id: ticketId, message },
      { headers: this.adminHeaders() },
    );
  }

  markAdminRead(ticketId: number) {
    return this.http.patch(
      `${this.baseUrl}/ticket-comment/admin/${ticketId}/read`,
      {},
      { headers: this.adminHeaders() },
    );
  }
}
