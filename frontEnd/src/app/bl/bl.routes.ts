import { Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';

export const blRoutes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./bl-list.component').then(m => m.BlListComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'create', 
    loadComponent: () => import('./bl-create/bl-create.component').then(m => m.BlCreateComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: ':id', 
    loadComponent: () => import('./bl-detail/bl-detail.component').then(m => m.BlDetailComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: ':id/edit', 
    loadComponent: () => import('./bl-edit/bl-edit.component').then(m => m.BlEditComponent),
    canActivate: [AuthGuard]
  }
];
