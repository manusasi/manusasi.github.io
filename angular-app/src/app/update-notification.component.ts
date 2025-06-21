import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateService } from './update.service';

@Component({
  selector: 'app-update-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="updateAvailable$ | async" class="update-notification">
      <div class="update-content">
        <div class="update-icon">🔄</div>
        <div class="update-text">
          <h4>New version available!</h4>
          <p>A new version of the app is ready. Refresh to get the latest features.</p>
        </div>
        <div class="update-actions">
          <button (click)="update()" class="update-btn">Update Now</button>
          <button (click)="dismiss()" class="dismiss-btn">Later</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .update-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border: 1px solid #e0e0e0;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .update-content {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .update-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .update-text {
      flex: 1;
    }

    .update-text h4 {
      margin: 0 0 4px 0;
      color: #333;
      font-size: 14px;
      font-weight: 600;
    }

    .update-text p {
      margin: 0;
      color: #666;
      font-size: 12px;
      line-height: 1.4;
    }

    .update-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .update-btn, .dismiss-btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .update-btn {
      background: #007bff;
      color: white;
    }

    .update-btn:hover {
      background: #0056b3;
    }

    .dismiss-btn {
      background: #f8f9fa;
      color: #666;
      border: 1px solid #dee2e6;
    }

    .dismiss-btn:hover {
      background: #e9ecef;
    }

    @media (max-width: 480px) {
      .update-notification {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }
      
      .update-content {
        flex-direction: column;
        text-align: center;
      }
      
      .update-actions {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class UpdateNotificationComponent {
  updateAvailable$;

  constructor(private updateService: UpdateService) {
    this.updateAvailable$ = this.updateService.updateAvailable;
  }

  update(): void {
    this.updateService.forceUpdate();
  }

  dismiss(): void {
    this.updateService.dismissUpdate();
  }
} 