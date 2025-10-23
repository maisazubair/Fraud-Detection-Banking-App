import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  // Fraud lockout mechanism
  failedAttempts = 0;
  isLocked = false;
  lockoutTime = 60; // seconds
  remainingTime = 0;
  lockoutInterval: any;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    if (this.isLocked) {
      this.errorMessage = `🚨 Too many failed attempts. Try again in ${this.remainingTime}s`;
    
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        // Reset on success
        this.failedAttempts = 0;
        this.errorMessage = '';
        this.router.navigate([`/dashboard/${res.userId}`], { state: { fullName: res.fullName } });
      },
      error: () => {
        this.failedAttempts++;
        if (this.failedAttempts >= 3) {
          this.triggerLockout();
        } else {
          this.errorMessage = `❌ Invalid username or password (Attempt ${this.failedAttempts}/3)`;
        }
      }
    });
  }

  triggerLockout() {
    this.isLocked = true;
    this.remainingTime = this.lockoutTime;
    this.errorMessage = `🚨 Fraud detected: Too many failed logins. Locked for ${this.lockoutTime}s`;

    this.lockoutInterval = setInterval(() => {
      this.remainingTime--;
      if (this.remainingTime <= 0) {
        this.isLocked = false;
        this.failedAttempts = 0;
        this.errorMessage = '';
        clearInterval(this.lockoutInterval);
      } else {
        this.errorMessage = `🚨 Too many failed attempts. Try again in ${this.remainingTime}s`;
      }
    }, 1000);
  }
}
