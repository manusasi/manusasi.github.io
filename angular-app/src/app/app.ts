import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginComponent } from './login.component';
import { UpdateNotificationComponent } from './update-notification.component';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, LoginComponent, UpdateNotificationComponent],
  templateUrl: './app.html'
})
export class AppComponent {
  isMobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  get user$() {
    return this.authService.user$;
  }

  get theme$() {
    return this.themeService.theme$;
  }

  logout() {
    this.authService.signOut();
    this.router.navigate(['/']);
  }

  // Login method to trigger Google authentication
  login() {
    this.authService.signInWithGoogle();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}
