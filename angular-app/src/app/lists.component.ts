import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TodoList } from './todo-list.model';
import { TodoListService } from './todo-list.service';
import { AuthService } from './auth.service';
import { Observable, take } from 'rxjs';
import { map } from 'rxjs/operators';
import { ListEditShareModalComponent } from './list-edit-share-modal.component';
import { BreadcrumbComponent } from './breadcrumb.component';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ListEditShareModalComponent, BreadcrumbComponent],
  templateUrl: './lists.component.html'
})
export class ListsComponent implements OnInit {
  todoLists: TodoList[] = [];
  isLoading = false;
  newListTitle = '';
  newListDescription = '';
  sharingList: TodoList | null = null;
  shareEmail = '';
  showShareModal = false;
  
  // Modal states
  showCreateModal = false;
  showEditModal = false;
  editingList: TodoList | null = null;
  editListTitle = '';
  editListDescription = '';
  showEditShareModal = false;
  modalMode: 'edit' | 'share' = 'edit';
  modalList: TodoList | null = null;
  breadcrumbItems = [
    { label: 'Home', route: '/' },
    { label: 'Todo Lists', route: undefined }
  ];

  constructor(
    private todoListService: TodoListService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadLists();
  }

  loadLists() {
    this.isLoading = true;
    this.todoListService.getLists().subscribe({
      next: (lists: TodoList[]) => {
        this.todoLists = lists;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading lists:', error);
        this.isLoading = false;
      }
    });
  }

  openCreateModal() {
    this.newListTitle = '';
    this.newListDescription = '';
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newListTitle = '';
    this.newListDescription = '';
  }

  createNewList() {
    if (!this.newListTitle.trim()) return;

    const title = this.newListTitle.trim();
    const description = this.newListDescription.trim() || undefined;

    // Add debugging to check authentication state
    this.authService.user$.pipe(take(1)).subscribe(user => {
      console.log('Current user:', user);
      if (!user) {
        console.error('No authenticated user found');
        alert('Please log in to create a list');
        return;
      }
    });

    this.todoListService.createList(title, description).subscribe({
      next: (createdList: any) => {
        console.log('List created successfully:', createdList);
        this.todoLists.unshift(createdList);
        this.closeCreateModal();
      },
      error: (error: any) => {
        console.error('Error creating list:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        
        // Provide user-friendly error message
        let errorMessage = 'Failed to create list. ';
        if (error.code === 'permission-denied') {
          errorMessage += 'You may not have permission to create lists. Please try logging out and back in.';
        } else if (error.code === 'unauthenticated') {
          errorMessage += 'Please log in to create lists.';
        } else {
          errorMessage += 'Please try again later.';
        }
        
        alert(errorMessage);
      }
    });
  }

  openEditModal(list: TodoList) {
    this.modalList = list;
    this.modalMode = 'edit';
    this.showEditShareModal = true;
  }

  openShareModal(list: TodoList) {
    this.modalList = list;
    this.modalMode = 'share';
    this.showEditShareModal = true;
  }

  closeModal() {
    this.showEditShareModal = false;
    this.modalList = null;
  }

  handleSaveEdit({ title, description }: { title: string; description: string }) {
    if (!this.modalList) return;
    const updatedList: TodoList = {
      ...this.modalList,
      title,
      description: description || undefined
    };
    this.todoListService.updateList(updatedList).then(() => {
      this.loadLists();
      this.closeModal();
    });
  }

  handleShare(email: string) {
    if (!this.modalList) return;
    this.todoListService.shareList(this.modalList.id!, email).then(() => {
      this.loadLists();
      this.closeModal();
    });
  }

  openList(list: TodoList) {
    this.router.navigate(['/todo', list.id]);
  }

  editList(list: TodoList, event: Event) {
    event.stopPropagation();
    this.openEditModal(list);
  }

  deleteList(list: TodoList, event: Event) {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete "${list.title}"?`)) {
      this.todoListService.deleteList(list.id!).then(() => {
        this.todoLists = this.todoLists.filter(l => l.id !== list.id);
      }).catch((error: any) => {
        console.error('Error deleting list:', error);
      });
    }
  }

  // Helper method to convert Firestore Timestamp to JavaScript Date
  getDateFromTimestamp(timestamp: any): Date | null {
    if (!timestamp) return null;
    
    // If it's already a Date object, return it
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    // If it's a Firestore Timestamp, convert it
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    // If it's a number (milliseconds), create Date from it
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    
    // If it's a string, try to parse it
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    
    return null;
  }

  // Helper method to get shared count safely
  getSharedCount(list: TodoList | null): number {
    if (!list || !list.sharedWith) {
      return 0;
    }
    return list.sharedWith.length;
  }
} 