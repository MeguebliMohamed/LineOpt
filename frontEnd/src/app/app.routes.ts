import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./auth/register.component').then(m => m.RegisterComponent) },
  {
    path: 'not-authorized',
    loadComponent: () => import('./not-authorized/not-authorized').then(m => m.NotAuthorizedComponent)
  },
  {
    path: 'not-found',
    loadComponent: () => import('./not-found/not-found').then(m => m.NotFoundComponent)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.dashboardRoutes)
  },
  {
    path: 'trucks',
    canActivate: [AuthGuard],
    loadChildren: () => import('./trucks/trucks.routes').then(m => m.trucksRoutes)
  },
  {
    path: 'queue',
    canActivate: [AuthGuard],
    loadChildren: () => import('./queue/queue.routes').then(m => m.queueRoutes)
  },
  {
    path: 'bl',
    canActivate: [AuthGuard],
    loadChildren: () => import('./bl/bl.routes').then(m => m.blRoutes)
  },
  {
    path: 'incidents',
    canActivate: [AuthGuard],
    loadChildren: () => import('./incidents/incidents.routes').then(m => m.incidentsRoutes)
  },
  {
    path: 'users',
    canActivate: [AuthGuard],
    loadChildren: () => import('./users/users.routes').then(m => m.usersRoutes)
  },
  {
    path: 'articles',
    canActivate: [AuthGuard],
    loadChildren: () => import('./articles/articles.routes').then(m => m.articlesRoutes)
  },
  { path: '**', redirectTo: 'not-found' }
];
