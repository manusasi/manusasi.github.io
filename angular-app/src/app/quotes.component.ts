import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuotesService, Quote } from './quotes.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './quotes.component.html',
})
export class QuotesComponent implements OnInit {
  quotes: Quote[] = [];
  displayedQuotes: Quote[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 1;
  quotesPerPage = 5;
  hasMoreQuotes = false;

  constructor(private quotesService: QuotesService) {}

  ngOnInit() {
    this.loadQuotes();
  }

  loadQuotes() {
    this.loading = true;
    this.error = null;
    
    this.quotesService.getQuotesList().subscribe({
      next: (quotesList) => {
        console.log('Quotes received:', quotesList);
        this.quotes = quotesList;
        this.updateDisplayedQuotes();
        this.loading = false;
      },
      error: (err) => {
        console.log('Error fetching quotes:', err);
        this.error = 'Failed to fetch quotes.';
        this.loading = false;
      }
    });
  }

  updateDisplayedQuotes() {
    const startIndex = 0;
    const endIndex = this.currentPage * this.quotesPerPage;
    this.displayedQuotes = this.quotes.slice(startIndex, endIndex);
    this.hasMoreQuotes = endIndex < this.quotes.length;
  }

  showMore() {
    this.currentPage++;
    this.updateDisplayedQuotes();
  }

  refreshQuotes() {
    this.currentPage = 1;
    this.loadQuotes();
  }
} 