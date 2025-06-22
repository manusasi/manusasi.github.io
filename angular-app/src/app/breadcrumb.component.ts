import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface BreadcrumbItem {
  label: string;
  route?: string;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <nav class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
      <ng-container *ngFor="let item of items; let last = last; let i = index">
        <ng-container *ngIf="!last; else lastItem">
          <a *ngIf="item.route; else noRoute" 
             [routerLink]="item.route"
             class="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
            <svg *ngIf="item.icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon"></path>
            </svg>
            <span>{{ item.label }}</span>
          </a>
          <span *ngIf="!item.route" class="flex items-center space-x-1">
            <svg *ngIf="item.icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon"></path>
            </svg>
            <span>{{ item.label }}</span>
          </span>
        </ng-container>
        
        <ng-template #lastItem>
          <span class="flex items-center space-x-1 text-gray-900 dark:text-white font-medium">
            <svg *ngIf="item.icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon"></path>
            </svg>
            <span>{{ item.label }}</span>
          </span>
        </ng-template>
        
        <ng-template #noRoute>
          <span class="flex items-center space-x-1">
            <svg *ngIf="item.icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon"></path>
            </svg>
            <span>{{ item.label }}</span>
          </span>
        </ng-template>
        
        <svg *ngIf="!last" class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </ng-container>
    </nav>
  `,
  styles: []
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
} 