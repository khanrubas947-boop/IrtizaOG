import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home')
        .then(m => m.HomeComponent)
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login')
        .then(m => m.Login)
  },

  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/auth/signup/signup')
        .then(m => m.SignupComponent)
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard')
        .then(m => m.Dashboard)
  },

  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/tasks/tasks')
        .then(m => m.Tasks)
  },

  {
    path: 'team',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/team/team')
        .then(m => m.Team)
  },

  {
    path: 'clients',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/clients/clients')
        .then(m => m.Clients)
  },

  {
    path: 'reports',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/reports/reports')
        .then(m => m.Reports)
  },

  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/settings/settings')
        .then(m => m.Settings)
  },

  {
    path: '**',
    redirectTo: ''
  }

]