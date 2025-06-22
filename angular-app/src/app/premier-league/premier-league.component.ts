import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PremierLeagueService } from '../premier-league.service';
import { HttpClientModule } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-premier-league',
  templateUrl: './premier-league.html',
  styleUrls: ['./premier-league.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [PremierLeagueService]
})
export class PremierLeagueComponent implements OnInit {
  standings$: Observable<any> | undefined;
  error: any;

  constructor(private premierLeagueService: PremierLeagueService) { }

  ngOnInit(): void {
    this.loadStandings();
  }

  loadStandings(): void {
    this.error = null;
    this.standings$ = this.premierLeagueService.getStandings().pipe(
      catchError(err => {
        this.error = err;
        console.error(err);
        return of(null); // Return a null observable to allow the template to handle the error state
      })
    );
  }
} 