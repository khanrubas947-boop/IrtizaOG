import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ticket {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator_name: string;
  creator_email: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/tickets';

  getTickets(): Observable<{ tickets: Ticket[] }> {
    return this.http.get<{ tickets: Ticket[] }>(
      this.apiUrl
    );
  }

  getTicket(id: number): Observable<{ ticket: Ticket }> {
    return this.http.get<{ ticket: Ticket }>(
      `${this.apiUrl}/${id}`
    );
  }

  createTicket(data: {
    title: string;
    description?: string;
    priority?: string;
  }): Observable<{
    message: string;
    ticket: Ticket;
  }> {
    return this.http.post<{
      message: string;
      ticket: Ticket;
    }>(
      this.apiUrl,
      data
    );
  }
}