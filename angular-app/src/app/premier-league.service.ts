import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PremierLeagueService {
  private apiUrl = 'https://premier-league-standings1.p.rapidapi.com/';

  constructor(private http: HttpClient) { }

  getStandings(): Observable<any> {
    const headers = new HttpHeaders()
      .set('X-RapidAPI-Key', environment.premierLeague.apiKey)
      .set('X-RapidAPI-Host', environment.premierLeague.apiHost);

    return this.http.get(this.apiUrl, { headers });
  }
} 