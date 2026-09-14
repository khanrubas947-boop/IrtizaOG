import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';

  showPassword = false;
  loading = false;
  error = '';

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {

    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Please enter your email and password.';
      return;
    }

    this.loading = true;

    this.authService.login(
      this.email.trim(),
      this.password
    ).subscribe({

      next: (response) => {

        console.log('Login successful:', response);

        this.loading = false;

        this.router.navigate(['/dashboard']);

      },

      error: (err) => {

        console.error('Login error:', err);

        this.loading = false;

        this.error =
          err?.error?.message ||
          'Login failed. Please check your email and password.';

      }

    });
  }
}