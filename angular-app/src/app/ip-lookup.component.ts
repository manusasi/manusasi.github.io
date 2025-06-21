import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService } from './location.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ip-lookup',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="ip-lookup-container">
      <header class="app-header">
        <a routerLink="/" class="back-link">← Back to Home</a>
        <h1>IP Lookup</h1>
        <p>Get detailed information about your current location</p>
      </header>
      
      <div class="location-card" *ngIf="locationData">
        <h2>Your Location Information</h2>
        <div class="location-grid">
          <div class="location-item">
            <span class="label">IP Address:</span>
            <span class="value">{{ locationData.ip }}</span>
          </div>
          <div class="location-item">
            <span class="label">Country:</span>
            <span class="value">{{ locationData.country_name }}</span>
          </div>
          <div class="location-item">
            <span class="label">Region:</span>
            <span class="value">{{ locationData.region_name }}</span>
          </div>
          <div class="location-item">
            <span class="label">City:</span>
            <span class="value">{{ locationData.city }}</span>
          </div>
          <div class="location-item">
            <span class="label">ZIP Code:</span>
            <span class="value">{{ locationData.zip }}</span>
          </div>
          <div class="location-item">
            <span class="label">Latitude:</span>
            <span class="value">{{ locationData.latitude }}</span>
          </div>
          <div class="location-item">
            <span class="label">Longitude:</span>
            <span class="value">{{ locationData.longitude }}</span>
          </div>
        </div>
      </div>
      
      <div class="loading" *ngIf="loading">
        <p>Loading location data...</p>
      </div>
      
      <div class="error" *ngIf="error">
        <p>Error: {{ error }}</p>
        <button (click)="loadLocation()" class="retry-btn">Try Again</button>
      </div>
    </div>
  `,
  styles: [`
    .ip-lookup-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .app-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .back-link {
      display: inline-block;
      color: #007bff;
      text-decoration: none;
      margin-bottom: 1rem;
      font-weight: 500;
    }
    
    .back-link:hover {
      text-decoration: underline;
    }
    
    .app-header h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 0.5rem;
    }
    
    .app-header p {
      color: #666;
      font-size: 1.1rem;
    }
    
    .location-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .location-card h2 {
      text-align: center;
      color: #333;
      margin-bottom: 2rem;
    }
    
    .location-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }
    
    .location-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;
    }
    
    .label {
      font-weight: 600;
      color: #555;
    }
    
    .value {
      color: #333;
    }
    
    .loading, .error {
      text-align: center;
      padding: 2rem;
    }
    
    .retry-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      margin-top: 1rem;
    }
    
    .retry-btn:hover {
      background: #0056b3;
    }
  `]
})
export class IpLookupComponent implements OnInit {
  locationData: any = null;
  loading = false;
  error: string | null = null;

  constructor(private locationService: LocationService) {}

  ngOnInit() {
    this.loadLocation();
  }

  loadLocation() {
    this.loading = true;
    this.error = null;
    
    this.locationService.getLocation().subscribe({
      next: (data) => {
        this.locationData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load location data. Please try again.';
        this.loading = false;
        console.error('Location error:', err);
      }
    });
  }
} 