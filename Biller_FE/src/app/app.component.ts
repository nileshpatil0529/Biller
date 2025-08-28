import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Biller_FE';
  constructor(public router: Router) {
    // Auto-login if token exists
    if (localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('token')) {
      if (this.router.url === '/login' || this.router.url === '/') {
        this.router.navigate(['/home']);
      }
    }
  }
  isLoginRoute() {
    return this.router.url === '/login';
  }
}
