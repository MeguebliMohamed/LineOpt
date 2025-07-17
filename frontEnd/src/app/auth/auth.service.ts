import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { User } from '../users/user.interface';

const API_URL = 'http://localhost:8000/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  private userKey = 'user_profile';
  private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
  private userSubject = new BehaviorSubject<User | null>(this.getCurrentUser());

  constructor(private http: HttpClient, private router: Router) {
    this.initializeUserFromToken();
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${API_URL}/token/`, { username, password }).pipe(
      map((response: any) => {
        this.setTokens(response.access, response.refresh);
        return response;
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${API_URL}/users/`, data);
  }

  refreshToken(): Observable<any> {
    const refresh = this.getRefreshToken();
    return this.http.post(`${API_URL}/token/refresh/`, { refresh }).pipe(
      map((response: any) => {
        this.setTokens(response.access, response.refresh);
        return response;
      })
    );
  }

  setTokens(access: string, refresh: string) {
    localStorage.setItem(this.accessTokenKey, access);
    localStorage.setItem(this.refreshTokenKey, refresh);
    this.loggedIn$.next(true);
    this.loadUserFromToken(access);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  logout() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.loggedIn$.next(false);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${API_URL}/user/profile/`).pipe(
      map((user: User) => {
        const groupName = user.groups && user.groups.length > 0 ? user.groups[0].name : null;
        const userProfile = { 
          id: user.id,
          username: user.username,
          group_name: groupName,
          full_name: user.full_name,
          email: user.email,
          groups: user.groups || []
        };
        localStorage.setItem(this.userKey, JSON.stringify(userProfile));
        this.userSubject.next(userProfile);
        return userProfile;
      })
    );
  }

  loadUserFromToken(token: string) {
    try {
      const decoded: any = jwtDecode(token);
      
      const user = {
        id: decoded.user_id || 0,
        username: decoded.username || '',
        group_name: decoded.groups && decoded.groups.length > 0 ? decoded.groups[0] : null,
        full_name: decoded.full_name || '',
        email: decoded.email || '',
        groups: decoded.groups || []
      };
      
      localStorage.setItem(this.userKey, JSON.stringify(user));
      this.userSubject.next(user);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  getCurrentUserObservable(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  getUsername(): string | null {
    const user = this.getCurrentUser();
    return user?.username || null;
  }

  getUserGroup(): string | null {
    const user = this.getCurrentUser();
    return user?.group_name || null;
  }

  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    const groups = user?.groups as any;
    return (Array.isArray(groups) && groups.includes('superAdmin')) || user?.group_name === 'superAdmin';
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.accessTokenKey);
  }

  private initializeUserFromToken() {
    const token = this.getAccessToken();
    if (token) {
      this.loadUserFromToken(token);
    }
  }
}