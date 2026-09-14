import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardData {
  openTickets: number;
  unresolved: number;
  dueToday: number;
  satisfaction: number;
  totalUsers: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/dashboard';

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.apiUrl);
  }
}