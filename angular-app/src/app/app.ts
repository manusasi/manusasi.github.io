import { Component, HostListener, ElementRef } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { User } from 'firebase/auth';
import { ThemeService } from './theme.service';
import { UpdateNotificationComponent } from './update-notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, UpdateNotificationComponent],
  templateUrl: './app.html',
})
export class AppComponent {
  user$: Observable<User | null>;
  theme$: Observable<string>;
  isMobileMenuOpen = false;
  isDetailPage$: Observable<boolean>;
  moreMenuOpen = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.moreMenuOpen = false;
    }
  }

  constructor(
    private authService: AuthService, 
    private themeService: ThemeService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    this.user$ = this.authService.user$;
    this.theme$ = this.themeService.theme$;
    this.isDetailPage$ = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects !== '/')
    );
  }

  login(): void {
    this.authService.signInWithGoogle();
  }

  logout(): void {
    this.authService.signOut();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  toggleMoreMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.moreMenuOpen = !this.moreMenuOpen;
  }

  closeMoreMenu(): void {
    this.moreMenuOpen = false;
  }
}
