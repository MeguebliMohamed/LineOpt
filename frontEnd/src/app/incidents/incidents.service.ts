import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8000/api/incidents/';

@Injectable({ providedIn: 'root' })
export class IncidentsService {
  constructor(private http: HttpClient) {}

  reportIncident(data: any): Observable<any> {
    return this.http.post(API_URL, data);
  }
}
