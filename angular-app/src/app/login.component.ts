import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-container">
      <h2>Sign in to Todo List</h2>
      <p>Please sign in to access your personal todo list</p>
      <button (click)="login()" class="login-btn">
        <img src="/assets/google-logo.svg" alt="Google logo" class="google-logo" />
        Sign in with Google
      </button>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      margin-top: 5rem;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
      padding: 2rem;
    }
    
    .login-btn {
      display: flex;
      align-items: center;
      background-color: #4285F4;
      color: white;
      padding: 10px 24px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 2px 4px 0 rgba(0,0,0,0.25);
      transition: box-shadow .3s ease;
    }
    .login-btn:hover {
      box-shadow: 0 4px 8px 0 rgba(0,0,0,0.25);
    }
    .google-logo {
      width: 20px;
      height: 20px;
      margin-right: 16px;
      background-color: white;
      border-radius: 50%;
      padding: 2px;
    }
  `]
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.signInWithGoogle().then(() => {
      // Redirect to lists page after successful login
      this.router.navigate(['/lists']);
    }).catch((error: any) => {
      console.error("Login failed:", error);
      // Optionally, show a message to the user
    });
  }
} 