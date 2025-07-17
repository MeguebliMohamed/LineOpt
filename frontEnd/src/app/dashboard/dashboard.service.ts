import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8000/api/dashboard/';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  getTrucksPerArticle(): Observable<any> {
    return this.http.get(`${API_URL}trucks-per-article/`);
  }

  getWaitTimes(): Observable<any> {
    return this.http.get(`${API_URL}wait-times/`);
  }

  getAlerts(): Observable<any> {
    return this.http.get(`${API_URL}alerts/`);
  }
}
