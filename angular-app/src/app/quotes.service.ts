import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface Quote {
  q: string; // quote text
  a: string; // author
  c?: string; // count
  h?: string; // HTML
}

@Injectable({ providedIn: 'root' })
export class QuotesService {
  private fallbackQuotes: Quote[] = [
    { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
    { q: "Life is what happens when you're busy making other plans.", a: "John Lennon" },
    { q: "The future belongs to those who believe in the beauty of their dreams.", a: "Eleanor Roosevelt" },
    { q: "Success is not final, failure is not fatal: it is the courage to continue that counts.", a: "Winston Churchill" },
    { q: "The mind is everything. What you think you become.", a: "Buddha" },
    { q: "People inspire you, or they drain you. Pick them wisely.", a: "Les Brown" },
    { q: "Change is never easy, but always possible.", a: "Barack Obama" },
    { q: "Do not go where the path may lead, go instead where there is no path and leave a trail.", a: "Ralph Waldo Emerson" },
    { q: "The best way to predict the future is to invent it.", a: "Alan Kay" },
    { q: "Innovation distinguishes between a leader and a follower.", a: "Steve Jobs" },
    { q: "Stay hungry, stay foolish.", a: "Steve Jobs" },
    { q: "The only limit to our realization of tomorrow is our doubts of today.", a: "Franklin D. Roosevelt" },
    { q: "It does not matter how slowly you go as long as you do not stop.", a: "Confucius" },
    { q: "The journey of a thousand miles begins with one step.", a: "Lao Tzu" },
    { q: "What you get by achieving your goals is not as important as what you become by achieving your goals.", a: "Zig Ziglar" }
  ];

  constructor(private http: HttpClient) {}

  getQuotesList(): Observable<Quote[]> {
    console.log('Returning fallback quotes list...');
    return of(this.fallbackQuotes);
  }

  getRandomQuote(): Observable<Quote> {
    const randomIndex = Math.floor(Math.random() * this.fallbackQuotes.length);
    return of(this.fallbackQuotes[randomIndex]);
  }
} 