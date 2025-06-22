import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { BreadcrumbComponent } from '../breadcrumb.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  templateUrl: './profile.html'
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  user$ = this.authService.user$;
  breadcrumbItems = [
    { label: 'Home', route: '/' },
    { label: 'Profile', route: undefined }
  ];

  // Usage Statistics
  stats = {
    todoLists: 0,
    familyTrees: 0,
    lastActivity: 'Today',
    accountAge: 'New'
  };

  // User Preferences
  preferences = {
    theme: 'System Default',
    language: 'English',
    notifications: 'Enabled',
    privacy: 'Standard'
  };

  logout() {
    this.authService.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  exportData() {
    // TODO: Implement data export functionality
    console.log('Export data functionality to be implemented');
    alert('Data export functionality will be implemented soon!');
  }
}
