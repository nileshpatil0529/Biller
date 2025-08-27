import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isLoggedInStatus = false;

  login(username: string, password: string): boolean {
    if (username === 'Nilesh' && password === '12345') {
      this.isLoggedInStatus = true;
      localStorage.setItem('isLoggedIn', 'true');
      return true;
    }
    this.isLoggedInStatus = false;
    localStorage.removeItem('isLoggedIn');
    return false;
  }

  logout() {
    this.isLoggedInStatus = false;
    localStorage.removeItem('isLoggedIn');
  }

  isLoggedIn(): boolean {
    return this.isLoggedInStatus || localStorage.getItem('isLoggedIn') === 'true';
  }
}
