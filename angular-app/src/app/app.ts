import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginComponent } from './login.component';
import { UpdateNotificationComponent } from './update-notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, LoginComponent, UpdateNotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  user$;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.user$;
  }

  logout(): void {
    this.authService.signOut();
  }
}
