import { Routes } from '@angular/router';

export const articlesRoutes: Routes = [
  { path: '', loadComponent: () => import('./articles-list.component').then(m => m.ArticlesListComponent) },
  { path: 'create', loadComponent: () => import('./article-create.component').then(m => m.ArticleCreateComponent) },
  { path: ':id', loadComponent: () => import('./article-detail.component').then(m => m.ArticleDetailComponent) },
  { path: ':id/edit', loadComponent: () => import('./article-detail.component').then(m => m.ArticleDetailComponent) }
];