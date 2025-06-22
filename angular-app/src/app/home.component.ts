import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { QuotesService, Quote } from './quotes.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  homeQuote: Quote | null = null;
  quoteLoading = false;
  quoteError: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private quotesService: QuotesService
  ) {}

  ngOnInit() {
    this.refreshQuote();
  }

  get user$() {
    return this.authService.user$;
  }

  navigateToLists() {
    this.router.navigate(['/lists']);
  }

  navigateToIpLookup() {
    this.router.navigate(['/ip-lookup']);
  }

  navigateToQuotes() {
    this.router.navigate(['/quotes']);
  }

  // Navigate to the Family Tree page
  navigateToFamilyTree() {
    this.router.navigate(['/family-tree']);
  }

  showProfile() {
    this.router.navigate(['/profile']);
  }

  refreshQuote() {
    this.quoteLoading = true;
    this.quoteError = null;
    
    this.quotesService.getRandomQuote().subscribe({
      next: (quote) => {
        this.homeQuote = quote;
        this.quoteLoading = false;
      },
      error: (err) => {
        this.quoteError = 'Failed to load quote.';
        this.quoteLoading = false;
      }
    });
  }
} 