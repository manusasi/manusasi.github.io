import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoList } from './todo-list.model';

@Component({
  selector: 'app-list-edit-share-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div *ngIf="open" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ mode === 'edit' ? 'Edit List' : 'Share List' }}</h3>
        <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <form *ngIf="mode === 'edit'" (ngSubmit)="saveEditList()" class="space-y-4">
        <div>
          <label for="editListTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="editListTitle"
            [(ngModel)]="editListTitle"
            name="editListTitle"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter list title"
          >
        </div>
        <div>
          <label for="editListDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (optional)
          </label>
          <textarea
            id="editListDescription"
            [(ngModel)]="editListDescription"
            name="editListDescription"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter list description"
          ></textarea>
        </div>
        <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Sharing</h4>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Share this list with others
                <span *ngIf="getSharedCount(list) > 0" class="text-blue-600 dark:text-blue-400">
                  • Currently shared with {{ getSharedCount(list) }} user{{ getSharedCount(list) > 1 ? 's' : '' }}
                </span>
              </p>
            </div>
            <button type="button" (click)="switchToShare()" class="btn-secondary text-sm flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>
        <div class="flex items-center justify-end space-x-3 pt-4">
          <button type="button" (click)="onClose()" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</button>
          <button type="submit" [disabled]="!editListTitle.trim()" class="btn-primary text-sm flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Save Changes</span>
          </button>
        </div>
      </form>
      <form *ngIf="mode === 'share'" (ngSubmit)="confirmShare()" class="space-y-4">
        <div>
          <label for="shareEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="shareEmail"
            [(ngModel)]="shareEmail"
            name="shareEmail"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter email address"
          >
        </div>
        <div class="flex items-center justify-end space-x-3 pt-4">
          <button type="button" (click)="switchToEdit()" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Back</button>
          <button type="submit" [disabled]="!shareEmail.trim()" class="btn-primary text-sm flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
            </svg>
            <span>Share</span>
          </button>
        </div>
      </form>
    </div>
  </div>
  `
})
export class ListEditShareModalComponent {
  @Input() open = false;
  @Input() list: TodoList | null = null;
  @Input() mode: 'edit' | 'share' = 'edit';
  @Output() save = new EventEmitter<{ title: string; description: string }>();
  @Output() share = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  editListTitle = '';
  editListDescription = '';
  shareEmail = '';

  ngOnChanges() {
    if (this.list) {
      this.editListTitle = this.list.title;
      this.editListDescription = this.list.description || '';
    }
  }

  saveEditList() {
    if (!this.editListTitle.trim()) return;
    this.save.emit({ title: this.editListTitle.trim(), description: this.editListDescription.trim() });
  }

  confirmShare() {
    if (!this.shareEmail.trim()) return;
    this.share.emit(this.shareEmail.trim());
  }

  onClose() {
    this.close.emit();
  }

  switchToShare() {
    this.mode = 'share';
  }

  switchToEdit() {
    this.mode = 'edit';
  }

  getSharedCount(list: TodoList | null): number {
    if (!list || !list.sharedWith) return 0;
    return list.sharedWith.length;
  }
} 