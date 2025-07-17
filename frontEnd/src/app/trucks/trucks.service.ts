import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { Truck, TruckStatus } from './truck.interface';
import { AuthService } from '../auth/auth.service';

const API_URL = 'http://localhost:8000/api/camions/';

@Injectable({ providedIn: 'root' })
export class TrucksService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  getTrucks(): Observable<Truck[]> {
    return this.http.get<Truck[]>(API_URL).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getTruck(id: number): Observable<Truck> {
    return this.http.get<Truck>(`${API_URL}${id}/`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  createTruck(data: Truck): Observable<Truck> {
    return this.http.post<Truck>(API_URL, data).pipe(
      catchError(error => this.handleError(error))
    );
  }

  updateTruck(id: number, data: Truck): Observable<Truck> {
    // Get the current truck data first to ensure we have the complete object
    return this.getTruck(id).pipe(
      switchMap(currentTruck => {
        // Create a clean payload with the exact format expected by the backend
        const payload = {
          matricule: data.matricule,
          statut: data.statut,
          client_par_defaut: data.client_par_defaut,
          articles: Array.isArray(data.articles) ? data.articles : []
        };
        
        return this.http.put<Truck>(`${API_URL}${id}/`, payload).pipe(
          catchError(error => this.handleError(error))
        );
      })
    );
  }

  deleteTruck(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}${id}/`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  changeStatus(id: number, status: TruckStatus): Observable<Truck> {
    // Send only the status parameter as expected by the backend
    return this.http.post<Truck>(`${API_URL}${id}/change_status/`, {
      status: status // Backend expects 'status', not 'statut'
    }).pipe(
      catchError(error => this.handleError(error)),
      // After successful status change, get the updated truck data
      switchMap(() => this.getTruck(id))
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