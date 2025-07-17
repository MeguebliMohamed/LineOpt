import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8000/api/files/';

@Injectable({ providedIn: 'root' })
export class QueueService {
  constructor(private http: HttpClient) {}

  getQueues(): Observable<any[]> {
    return this.http.get<any[]>(API_URL);
  }

  addToQueue(article: number, camion: number): Observable<any> {
    return this.http.post(`${API_URL}add_to_queue/`, { article, camion });
  }

  removeFromQueue(article: number, camion: number): Observable<any> {
    return this.http.post(`${API_URL}remove_from_queue/`, { article, camion });
  }
}
