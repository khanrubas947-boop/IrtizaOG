import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  RouterLink,
  RouterLinkActive,
  Router
} from '@angular/router';

import { AuthService } from '../../services/auth';

import {
  DashboardService,
  DashboardData
} from '../../services/dashboard';

import {
  TicketService,
  Ticket
} from '../../services/tickets';

interface DashboardTicket extends Ticket {
  initials: string;
  statusClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private router = inject(Router);
  private authService = inject(AuthService);

  private dashboardService = inject(DashboardService);
  private ticketService = inject(TicketService);

  searchQuery = '';

  loading = true;
  ticketsLoading = true;

  error = '';
  ticketsError = '';

  profileMenuOpen = false;

  dashboardData: DashboardData = {
    openTickets: 0,
    unresolved: 0,
    dueToday: 0,
    satisfaction: 100,
    totalUsers: 0
  };

  stats = [
    {
      label: 'Open Tickets',
      value: '0',
      change: '+0%',
      positive: true
    },
    {
      label: 'Unresolved',
      value: '0',
      change: '+0%',
      positive: true
    },
    {
      label: 'Due Today',
      value: '0',
      change: '+0%',
      positive: true
    },
    {
      label: 'Satisfaction',
      value: '100%',
      change: '+0%',
      positive: true
    }
  ];

  recentTickets: DashboardTicket[] = [];

  ngOnInit(): void {
    this.loadDashboard();
    this.loadTickets();
  }

  /*
  |--------------------------------------------------------------------------
  | Dashboard
  |--------------------------------------------------------------------------
  */

  loadDashboard(): void {
    this.loading = true;
    this.error = '';

    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;

        this.stats = [
          {
            label: 'Open Tickets',
            value: data.openTickets.toString(),
            change: '+0%',
            positive: true
          },
          {
            label: 'Unresolved',
            value: data.unresolved.toString(),
            change: '+0%',
            positive: true
          },
          {
            label: 'Due Today',
            value: data.dueToday.toString(),
            change: '+0%',
            positive: true
          },
          {
            label: 'Satisfaction',
            value: `${data.satisfaction}%`,
            change: '+0%',
            positive: true
          }
        ];

        this.loading = false;
      },

      error: (err) => {
        console.error('Dashboard error:', err);

        this.loading = false;

        this.error =
          err?.error?.message ||
          'Could not load dashboard data.';
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Tickets
  |--------------------------------------------------------------------------
  */

  loadTickets(): void {
    this.ticketsLoading = true;
    this.ticketsError = '';

    this.ticketService.getTickets().subscribe({
      next: (response) => {

        this.recentTickets = response.tickets.map(
          (ticket) => this.prepareTicket(ticket)
        );

        this.ticketsLoading = false;
      },

      error: (err) => {
        console.error('Tickets error:', err);

        this.ticketsLoading = false;

        this.ticketsError =
          err?.error?.message ||
          'Could not load tickets.';
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Prepare ticket for existing dashboard design
  |--------------------------------------------------------------------------
  */

  private prepareTicket(ticket: Ticket): DashboardTicket {

    const name = ticket.creator_name?.trim() || 'User';

    const initials = name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');

    return {
      ...ticket,
      initials: initials || 'U',
      statusClass: this.getStatusClass(ticket.status)
    };
  }

  private getStatusClass(status: string): string {

    switch (status.toLowerCase()) {
      case 'open':
        return 'open';

      case 'in progress':
        return 'progress';

      case 'pending':
        return 'pending';

      case 'resolved':
        return 'resolved';

      default:
        return '';
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Ticket search
  |--------------------------------------------------------------------------
  */

  get filteredTickets(): DashboardTicket[] {

    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      return this.recentTickets;
    }

    return this.recentTickets.filter(ticket =>
      ticket.title.toLowerCase().includes(query) ||
      `#TKT-${ticket.id}`.toLowerCase().includes(query) ||
      ticket.status.toLowerCase().includes(query) ||
      ticket.priority.toLowerCase().includes(query) ||
      ticket.creator_name.toLowerCase().includes(query)
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Profile menu
  |--------------------------------------------------------------------------
  */

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  logout(): void {
    this.authService.logout();

    this.profileMenuOpen = false;

    this.router.navigate(['/login']);
  }
}