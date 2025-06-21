import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get user$() {
    return this.authService.user$;
  }

  navigateToLists() {
    this.router.navigate(['/lists']);
  }

  navigateToIpLookup() {
    this.router.navigate(['/ip-lookup']);
  }

  showProfile() {
    this.router.navigate(['/profile']);
  }
} 