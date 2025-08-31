import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ThemeService } from '../shared/theme.service';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {
  title = 'Biller';
  menuItems = [
    { label: 'Invoice', route: '/invoices', icon: 'receipt_long' },
    { label: 'Products', route: '/products', icon: 'inventory_2' },
    { label: 'Reports', route: '/reports', icon: 'bar_chart' },
    { label: 'Users', route: '/users', icon: 'people' },
    { label: 'Setting', route: '/setting', icon: 'settings' }
  ];
  collapsed = false;
  sidenavToggleActive = false;
  constructor(
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }
  toggleSidenav() {
    this.collapsed = !this.collapsed;
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  handleOutsideClick(event: MouseEvent) {
    const sidenav = document.querySelector('.sidenav');
    const toggleBtn = document.querySelector('button[aria-label="Toggle sidenav"]');
    if (
      sidenav &&
      !sidenav.contains(event.target as Node) &&
      !(toggleBtn && toggleBtn.contains(event.target as Node))
    ) {
      this.collapsed = true;
    }
  }
}
