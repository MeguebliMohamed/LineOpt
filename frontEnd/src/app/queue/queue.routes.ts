import { Routes } from '@angular/router';
export const queueRoutes: Routes = [
  { path: '', loadComponent: () => import('./queue-list.component').then(m => m.QueueListComponent) }
];
