import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container">
      <header class="hero">
        <h1>Manu's App Library</h1>
        <p>A collection of useful web applications</p>
      </header>
      
      <div class="apps-grid">
        <div class="app-card">
          <div class="app-icon">🌐</div>
          <h3>IP Lookup</h3>
          <p>Get detailed information about your current IP address and location</p>
          <a routerLink="/ip-lookup" class="app-link">Try it out</a>
        </div>
        
        <div class="app-card">
          <div class="app-icon">✅</div>
          <h3>Todo Lists</h3>
          <p>Manage your tasks with drag-and-drop reordering, cloud sync, and sharing</p>
          <a *ngIf="user$ | async; else loginLink" routerLink="/lists" class="app-link">Get started</a>
          <ng-template #loginLink>
            <a routerLink="/login" class="app-link">Sign in to start</a>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .hero {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .hero h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 0.5rem;
    }
    
    .hero p {
      font-size: 1.2rem;
      color: #666;
    }
    
    .apps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .app-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .app-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .app-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    .app-card h3 {
      font-size: 1.5rem;
      color: #333;
      margin-bottom: 1rem;
    }
    
    .app-card p {
      color: #666;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }
    
    .app-link {
      display: inline-block;
      background: #007bff;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      transition: background-color 0.2s ease;
    }
    
    .app-link:hover {
      background: #0056b3;
    }
  `]
})
export class HomeComponent {
  user$;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.user$;
  }
} 