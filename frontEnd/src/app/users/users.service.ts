import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUser, Group, Permission, CreateGroup } from './user.interface';

const API_URL = 'http://localhost:8000/api';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}/users/`);
  }

  createUser(data: CreateUser): Observable<User> {
    return this.http.post<User>(`${API_URL}/users/`, data);
  }

  updateUser(id: number, data: Partial<CreateUser>): Observable<User> {
    return this.http.put<User>(`${API_URL}/users/${id}/`, data);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/users/${id}/`);
  }

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${API_URL}/groups/`);
  }

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${API_URL}/permissions/`);
  }

  updateUserPermissions(userId: number, permissions: number[]): Observable<any> {
    return this.http.put(`${API_URL}/users/${userId}/permissions/update/`, { permissions });
  }

  createGroup(data: CreateGroup): Observable<Group> {
    return this.http.post<Group>(`${API_URL}/groups/`, data);
  }

  updateGroup(id: number, data: Partial<CreateGroup>): Observable<Group> {
    return this.http.put<Group>(`${API_URL}/groups/${id}/`, data);
  }

  deleteGroup(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/groups/${id}/`);
  }

  getGroupPermissions(groupId: number): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${API_URL}/groups/${groupId}/permissions/`);
  }

  updateGroupPermissions(groupId: number, permissions: number[]): Observable<any> {
    return this.http.put(`${API_URL}/groups/${groupId}/permissions/`, { permissions });
  }
}
