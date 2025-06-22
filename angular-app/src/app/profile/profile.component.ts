import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html'
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  user$ = this.authService.user$;

  logout() {
    this.authService.signOut();
    this.router.navigate(['/']);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
