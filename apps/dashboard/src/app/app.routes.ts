import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },

  {
    path: 'login',
    loadComponent: () => import('./pages/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tasks.page').then((m) => m.TasksPage),
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/projects.page').then((m) => m.ProjectsPage),
  },
  {
    path: 'audit',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/audit.page').then((m) => m.AuditPage),
  },

  { path: '**', redirectTo: 'tasks' },
];
