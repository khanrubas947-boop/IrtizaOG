import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

interface SignupResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupComponent {

  name = '';
  email = '';
  password = '';

  loading = false;
  error = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  createAccount(): void {

    console.log('CREATE ACCOUNT CLICKED');

    this.error = '';

    const cleanName = this.name.trim();
    const cleanEmail = this.email.trim().toLowerCase();
    const cleanPassword = this.password;

    console.log('Signup data:', {
      name: cleanName,
      email: cleanEmail,
      passwordLength: cleanPassword.length
    });

    if (!cleanName) {
      this.error = 'Please enter your full name.';
      return;
    }

    if (!cleanEmail) {
      this.error = 'Please enter your email.';
      return;
    }

    if (!cleanPassword) {
      this.error = 'Please enter a password.';
      return;
    }

    if (cleanPassword.length < 8) {
      this.error = 'Password must be at least 8 characters.';
      return;
    }

    this.loading = true;

    console.log('Sending signup request...');

    this.http.post<SignupResponse>(
      'http://localhost:3000/api/auth/signup',
      {
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword
      }
    ).subscribe({

      next: (response) => {

        console.log('SIGNUP SUCCESS:', response);

        localStorage.setItem(
          'quickdesk_token',
          response.token
        );

        localStorage.setItem(
          'quickdesk_user',
          JSON.stringify(response.user)
        );

        this.loading = false;

        this.router.navigate(['/dashboard']);
      },

      error: (err) => {

        console.error('SIGNUP FAILED:', err);

        this.loading = false;

        this.error =
          err?.error?.message ||
          `Signup failed (${err?.status || 'unknown error'}).`;

      }

    });
  }
}