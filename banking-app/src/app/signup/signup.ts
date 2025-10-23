import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent {
  username = '';
  password = '';
  fullName = '';
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

 signup() {
  this.errorMessage = '';
  this.successMessage = '';

  if (!this.username || !this.password || !this.fullName) {
    this.errorMessage = '⚠️ All fields are required';
    return;
  }

  this.authService.register(this.username, this.password, this.fullName).subscribe({
    next: () => {
      this.successMessage = '✅ Registration successful! Redirecting to login...';
      setTimeout(() => this.router.navigate(['/login']), 2000); // redirect after 2s
    },
    error: (err) => {
      this.errorMessage = err.error?.message || '❌ Registration failed';
    }
  });
}

}
