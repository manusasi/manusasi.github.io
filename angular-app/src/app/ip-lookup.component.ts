import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService } from './location.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ip-lookup',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ip-lookup.component.html'
})
export class IpLookupComponent implements OnInit {
  ipInfo: any = null;
  isLoading = false;
  error: string | null = null;

  constructor(private locationService: LocationService) {}

  ngOnInit() {
    this.refreshIpInfo();
  }

  refreshIpInfo() {
    this.isLoading = true;
    this.error = null;
    
    this.locationService.getLocation().subscribe({
      next: (data) => {
        this.ipInfo = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load IP information. Please try again.';
        this.isLoading = false;
        console.error('IP lookup error:', err);
      }
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('IP address copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }
} 