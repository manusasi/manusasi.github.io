import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  private updateAvailable$ = new BehaviorSubject<boolean>(false);
  private currentVersion = '1.0.0'; // This will be updated during build
  private checkInterval = 5 * 60 * 1000; // Check every 5 minutes

  constructor(private http: HttpClient) {
    this.startVersionChecking();
  }

  get updateAvailable(): Observable<boolean> {
    return this.updateAvailable$.asObservable();
  }

  private startVersionChecking(): void {
    // Check for updates every 5 minutes
    interval(this.checkInterval).pipe(
      switchMap(() => this.checkForUpdates())
    ).subscribe();
  }

  private checkForUpdates(): Observable<void> {
    return new Observable(observer => {
      // Get the current timestamp from the main.js file
      const script = document.querySelector('script[src*="main"]') as HTMLScriptElement;
      if (script) {
        const currentTimestamp = this.extractTimestampFromUrl(script.src);
        const cachedTimestamp = localStorage.getItem('app-version-timestamp');
        
        if (cachedTimestamp && cachedTimestamp !== currentTimestamp) {
          this.updateAvailable$.next(true);
        }
        
        localStorage.setItem('app-version-timestamp', currentTimestamp);
      }
      observer.next();
      observer.complete();
    });
  }

  private extractTimestampFromUrl(url: string): string {
    // Extract timestamp from URLs like main-WTDWOILR.js
    const match = url.match(/main-([^.]+)\.js/);
    return match ? match[1] : Date.now().toString();
  }

  public forceUpdate(): void {
    // Clear cache and reload
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Clear localStorage
    localStorage.clear();
    
    // Reload the page
    window.location.reload();
  }

  public dismissUpdate(): void {
    this.updateAvailable$.next(false);
  }
} 