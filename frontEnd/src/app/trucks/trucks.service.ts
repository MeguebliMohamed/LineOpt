import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Truck, TruckStatus } from './truck.interface';
import { AuthService } from '../auth/auth.service';

const API_URL = 'http://localhost:8000/api/camions/';

@Injectable({ providedIn: 'root' })
export class TrucksService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  private validateStatus(status: any): TruckStatus {
    const validStatuses: TruckStatus[] = [
      'disponible',
      'en_attente',
      'en_pause',
      'en_panne',
      'en_entretien',
      'charge',
      'sorti'
    ];
    return validStatuses.includes(status) ? status : 'disponible';
  }

  private normalizeTruck(truck: any): Truck {
    return {
      id: typeof truck.id === 'number' ? truck.id : undefined,
      matricule: String(truck.matricule || ''),
      statut: this.validateStatus(truck.statut),
      client_par_defaut: typeof truck.client_par_defaut === 'number' ? truck.client_par_defaut : null,
      articles: Array.isArray(truck.articles) ? truck.articles.map((id: any) => Number(id)).filter((id: number) => !isNaN(id)) : []
    };
  }

  getTrucks(): Observable<Truck[]> {
    return this.http.get<any[]>(API_URL).pipe(
      map(trucks => trucks.map(truck => this.normalizeTruck(truck))),
      catchError(error => this.handleError(error))
    );
  }

  getTruck(id: number): Observable<Truck> {
    return this.http.get<any>(`${API_URL}${id}/`).pipe(
      map(truck => this.normalizeTruck(truck)),
      catchError(error => this.handleError(error))
    );
  }

  createTruck(data: Partial<Truck>): Observable<Truck> {
    const payload = {
      matricule: data.matricule,
      statut: this.validateStatus(data.statut),
      client_par_defaut: data.client_par_defaut,
      articles: Array.isArray(data.articles) ? data.articles : []
    };
    return this.http.post<any>(API_URL, payload).pipe(
      map(truck => this.normalizeTruck(truck)),
      catchError(error => this.handleError(error))
    );
  }

  updateTruck(id: number, data: Truck): Observable<Truck> {
    return this.getTruck(id).pipe(
      switchMap(currentTruck => {
        const payload = {
          matricule: data.matricule || currentTruck.matricule,
          statut: this.validateStatus(data.statut),
          client_par_defaut: data.client_par_defaut !== undefined ? data.client_par_defaut : currentTruck.client_par_defaut,
          articles: Array.isArray(data.articles) ? data.articles : currentTruck.articles
        };
        return this.http.put<any>(`${API_URL}${id}/`, payload).pipe(
          map(truck => this.normalizeTruck(truck)),
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
    return this.http.post<any>(`${API_URL}${id}/change_status/`, { status }).pipe(
      map(truck => this.normalizeTruck(truck)),
      catchError(error => this.handleError(error)),
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
