import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = 'http://api.ipstack.com/check?access_key=c30488184006475d64ed23dfcf4dc153';

  constructor(private http: HttpClient) { }

  getLocation(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
} 