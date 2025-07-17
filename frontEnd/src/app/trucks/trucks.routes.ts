import { Routes } from '@angular/router';

export const trucksRoutes: Routes = [
  { path: '', loadComponent: () => import('./trucks-list.component').then(m => m.TrucksListComponent) },
  { path: 'create', loadComponent: () => import('./truck-create.component').then(m => m.TruckCreateComponent) },
  { path: ':id', loadComponent: () => import('./truck-detail.component').then(m => m.TruckDetailComponent) },
  { path: ':id/edit', loadComponent: () => import('./truck-detail.component').then(m => m.TruckDetailComponent) }
];