import { Routes } from '@angular/router';
export const incidentsRoutes: Routes = [
  { path: '', loadComponent: () => import('./incidents-list.component').then(m => m.IncidentsListComponent) }
];
