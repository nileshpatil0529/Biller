
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { LoaderService } from '../shared/services/loader.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private loader: LoaderService) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    const { username, password } = this.loginForm.value;
    this.loader.show();
    this.authService.login(username, password).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/invoices']);
        } else {
          this.error = 'Invalid username or password';
        }
      },
      error: () => {
        this.error = 'Invalid username or password';
      },
      complete: () => this.loader.hide()
    });
  }
}
