import { Routes } from '@angular/router';
import { SuperAdminGuard } from '../auth/super-admin.guard';

export const usersRoutes: Routes = [
  { 
    path: '', 
    canActivate: [SuperAdminGuard],
    loadComponent: () => import('./user-management.component').then(m => m.UserManagementComponent) 
  },
  { 
    path: 'create', 
    canActivate: [SuperAdminGuard],
    loadComponent: () => import('./user-create.component').then(m => m.UserCreateComponent) 
  },
  { 
    path: 'groups', 
    canActivate: [SuperAdminGuard],
    loadComponent: () => import('./groups-list.component').then(m => m.GroupsListComponent) 
  },
  { 
    path: 'groups/create', 
    canActivate: [SuperAdminGuard],
    loadComponent: () => import('./group-create.component').then(m => m.GroupCreateComponent) 
  }
];
