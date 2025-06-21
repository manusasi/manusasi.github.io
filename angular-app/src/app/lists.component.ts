import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TodoList } from './todo-list.model';
import { TodoListService } from './todo-list.service';
import { AuthService } from './auth.service';
import { Observable, take } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="lists-container">
      <header class="page-header">
        <h2>My Todo Lists</h2>
        <p>Create and manage your todo lists</p>
      </header>

      <!-- Create New List Form -->
      <div class="create-list-section">
        <h3>Create New List</h3>
        <form class="create-list-form" (ngSubmit)="createList()">
          <input
            type="text"
            [(ngModel)]="newListTitle"
            name="newListTitle"
            placeholder="List title..."
            class="list-input"
            required
          />
          <input
            type="text"
            [(ngModel)]="newListDescription"
            name="newListDescription"
            placeholder="Description (optional)..."
            class="list-input"
          />
          <button type="submit" class="btn create-btn">Create List</button>
        </form>
      </div>

      <!-- Lists Grid -->
      <div class="lists-grid">
        <div *ngFor="let list of lists$ | async" class="list-card">
          <div class="list-header">
            <h3>{{ list.title }}</h3>
            <div class="list-actions">
              <button (click)="openList(list)" class="btn open-btn">Open</button>
              <button (click)="shareList(list)" class="btn share-btn">Share</button>
              <button (click)="deleteList(list.id!)" class="btn delete-btn">Delete</button>
            </div>
          </div>
          <p *ngIf="list.description" class="list-description">{{ list.description }}</p>
          <div class="list-meta">
            <span class="list-owner" *ngIf="isOwner(list) | async">Owner</span>
            <span class="list-shared" *ngIf="!(isOwner(list) | async)">Shared with you</span>
            <span class="list-date">{{ getDate(list.updatedAt) | date:'short' }}</span>
          </div>
          <div *ngIf="list.sharedWith && list.sharedWith.length > 0" class="shared-with">
            <small>Shared with: {{ list.sharedWith.join(', ') }}</small>
          </div>
        </div>
      </div>

      <!-- Share Modal -->
      <div *ngIf="sharingList" class="modal-overlay" (click)="closeShareModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Share "{{ sharingList.title }}"</h3>
          <form (ngSubmit)="confirmShare()">
            <input
              type="email"
              [(ngModel)]="shareEmail"
              name="shareEmail"
              placeholder="Enter email address..."
              class="share-input"
              required
            />
            <div class="modal-actions">
              <button type="submit" class="btn share-btn">Share</button>
              <button type="button" (click)="closeShareModal()" class="btn cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .lists-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .page-header h2 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: #666;
      font-size: 1.1rem;
    }

    .create-list-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .create-list-section h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .create-list-form {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
    }

    .list-input {
      flex: 1;
      padding: 0.75rem;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .lists-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .list-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .list-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .list-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.2rem;
    }

    .list-actions {
      display: flex;
      gap: 0.5rem;
    }

    .list-description {
      color: #666;
      margin-bottom: 1rem;
      font-style: italic;
    }

    .list-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .list-owner {
      background: #28a745;
      color: white;
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    .list-shared {
      background: #ffc107;
      color: #333;
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    .list-date {
      color: #999;
      font-size: 0.9rem;
    }

    .shared-with {
      margin-top: 0.5rem;
      color: #666;
      font-size: 0.9rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      color: white;
    }

    .create-btn { background-color: #28a745; }
    .open-btn { background-color: #007bff; }
    .share-btn { background-color: #17a2b8; }
    .delete-btn { background-color: #dc3545; }
    .cancel-btn { background-color: #6c757d; }

    .btn:hover {
      opacity: 0.9;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      min-width: 400px;
    }

    .modal-content h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .share-input {
      width: 100%;
      padding: 0.75rem;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }
  `]
})
export class ListsComponent implements OnInit {
  lists$: Observable<TodoList[]>;
  newListTitle = '';
  newListDescription = '';
  sharingList: TodoList | null = null;
  shareEmail = '';

  constructor(
    private todoListService: TodoListService,
    private authService: AuthService,
    private router: Router
  ) {
    this.lists$ = this.todoListService.getLists();
  }

  ngOnInit(): void {}

  createList(): void {
    if (this.newListTitle.trim()) {
      this.todoListService.createList(this.newListTitle.trim(), this.newListDescription.trim()).subscribe({
        next: (result) => {
          this.newListTitle = '';
          this.newListDescription = '';
          console.log('List created:', result);
        },
        error: (err) => {
          console.error('Error creating list:', err);
        }
      });
    }
  }

  openList(list: TodoList): void {
    this.router.navigate(['/todo', list.id]);
  }

  shareList(list: TodoList): void {
    this.sharingList = list;
    this.shareEmail = '';
  }

  closeShareModal(): void {
    this.sharingList = null;
    this.shareEmail = '';
  }

  confirmShare(): void {
    if (this.sharingList && this.shareEmail.trim()) {
      this.todoListService.shareList(this.sharingList.id!, this.shareEmail.trim()).then(() => {
        this.closeShareModal();
        console.log('List shared successfully');
      }).catch((error) => {
        console.error('Error sharing list:', error);
      });
    }
  }

  deleteList(listId: string): void {
    if (confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
      this.todoListService.deleteList(listId).then(() => {
        console.log('List deleted successfully');
      }).catch((error) => {
        console.error('Error deleting list:', error);
      });
    }
  }

  isOwner(list: TodoList): Observable<boolean> {
    return this.authService.user$.pipe(
      map(user => user?.uid === list.owner)
    );
  }

  getDate(timestamp: any): Date {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    return new Date(); // Fallback to current date if timestamp is invalid or not a Date object
  }

  logout(): void {
    this.authService.signOut();
  }
} 