import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Article } from './article.interface';
import { AuthService } from '../auth/auth.service';

const API_URL = 'http://localhost:8000/api/articles/';

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(API_URL).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getArticle(id: number): Observable<Article> {
    return this.http.get<Article>(`${API_URL}${id}/`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  createArticle(data: Article): Observable<Article> {
    return this.http.post<Article>(API_URL, data).pipe(
      catchError(error => this.handleError(error))
    );
  }

  updateArticle(id: number, data: Article): Observable<Article> {
    return this.http.put<Article>(`${API_URL}${id}/`, data).pipe(
      catchError(error => this.handleError(error))
    );
  }

  partialUpdateArticle(id: number, data: Partial<Article>): Observable<Article> {
    return this.http.patch<Article>(`${API_URL}${id}/`, data).pipe(
      catchError(error => this.handleError(error))
    );
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}${id}/`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.status === 0) {
      errorMessage = 'Problème de connexion au serveur';
      console.error('Une erreur est survenue:', error.error);
    } else if (error.status === 401) {
      errorMessage = 'Vous n\'êtes pas autorisé à accéder à cette ressource';
      console.error('Erreur d\'authentification:', error.error);
    } else if (error.status === 403) {
      errorMessage = 'Vous n\'avez pas les permissions nécessaires';
      console.error('Erreur de permission:', error.error);
    } else {
      errorMessage = `${error.status}: ${error.error?.message || error.statusText}`;
      console.error(`Erreur API ${error.status}:`, error.error);
    }
    
    return throwError(() => new Error(errorMessage));
  }
}