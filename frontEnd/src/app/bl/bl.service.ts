import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Bl, Article, Client, Camion, BlStatus } from './bl.model';
import { AuthService } from '../auth/auth.service';

const API_URL = 'http://localhost:8000/api/bl/';
const ARTICLES_URL = 'http://localhost:8000/api/articles/';
const CLIENTS_URL = 'http://localhost:8000/api/clients/';
const CAMIONS_URL = 'http://localhost:8000/api/camions/';

@Injectable({ providedIn: 'root' })
export class BlService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  getBLs(status?: BlStatus): Observable<Bl[]> {
    let url = API_URL;
    if (status) url += `?status=${status}`;
    return this.http.get<Bl[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  getBl(id: string): Observable<Bl> {
    return this.http.get<Bl>(`${API_URL}${id}/`).pipe(
      catchError(this.handleError)
    );
  }

  createBl(data: any): Observable<any> {
    return this.http.post(API_URL, data).pipe(
      catchError(this.handleError)
    );
  }

  updateBl(id: string, data: any): Observable<any> {
    return this.http.put(`${API_URL}${id}/`, data).pipe(
      catchError(this.handleError)
    );
  }

  deleteBl(id: string): Observable<any> {
    return this.http.delete(`${API_URL}${id}/`).pipe(
      catchError(this.handleError)
    );
  }

  // Related data methods
  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(ARTICLES_URL).pipe(
      catchError(this.handleError)
    );
  }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(CLIENTS_URL).pipe(
      catchError(this.handleError)
    );
  }

  getCamions(): Observable<Camion[]> {
    return this.http.get<Camion[]>(CAMIONS_URL).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.status === 0) {
      // A client-side or network error occurred
      errorMessage = 'Problème de connexion au serveur';
      console.error('Une erreur est survenue:', error.error);
    } else if (error.status === 401) {
      // Unauthorized error
      errorMessage = 'Vous n\'êtes pas autorisé à accéder à cette ressource';
      console.error('Erreur d\'authentification:', error.error);
    } else if (error.status === 403) {
      // Forbidden error
      errorMessage = 'Vous n\'avez pas les permissions nécessaires';
      console.error('Erreur de permission:', error.error);
    } else {
      // The backend returned an unsuccessful response code
      errorMessage = `${error.status}: ${error.error?.message || error.statusText}`;
      console.error(`Erreur API ${error.status}:`, error.error);
    }
    
    // Return an observable with a user-facing error message
    return throwError(() => new Error(errorMessage));
  }
}
