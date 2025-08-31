  export interface User {
  id: number;
  name: string;
  username: string;
  role: string;
  }

  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';
  import { environment } from '../../environments/environment';

  @Injectable({ providedIn: 'root' })
  export class UsersService {
  private apiUrlToGet = environment.apiBaseUrl + 'api/users';
  private apiUrlToCreate = environment.apiBaseUrl + 'api/auth/register';

    constructor(private http: HttpClient) {}

    getUsers(): Observable<any> {
      return this.http.get<any>(this.apiUrlToGet);
    }

    createUser(user: { username: string; role: string }): Observable<any> {
      // Always send password as '12345' for new users
      return this.http.post<any>(this.apiUrlToCreate, { ...user, password: '12345' });
    }

    deleteUser(id: number): Observable<any> {
      return this.http.delete<any>(`${this.apiUrlToGet}/${id}`);
    }

    updateUser(id: number, user: { username: string; role: string }): Observable<any> {
      return this.http.put<any>(`${this.apiUrlToGet}/${id}`, user);
    }
  }
