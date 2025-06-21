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

    this.todoListService.createList(title, description).subscribe({
      next: (createdList: any) => {
        this.todoLists.unshift(createdList);
        this.closeCreateModal();
      },
      error: (error: any) => {
        console.error('Error creating list:', error);
      }
    });
  }

  openEditModal(list: TodoList) {
    this.editingList = list;
    this.editListTitle = list.title;
    this.editListDescription = list.description || '';
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingList = null;
    this.editListTitle = '';
    this.editListDescription = '';
  }

  saveEditList() {
    if (!this.editingList || !this.editListTitle.trim()) return;

    const updatedList: TodoList = {
      ...this.editingList,
      title: this.editListTitle.trim(),
      description: this.editListDescription.trim() || undefined
    };

    this.todoListService.updateList(updatedList).then(() => {
      // Update the list in the local array
      const index = this.todoLists.findIndex(l => l.id === this.editingList!.id);
      if (index !== -1) {
        this.todoLists[index] = updatedList;
      }
      this.closeEditModal();
    }).catch((error: any) => {
      console.error('Error updating list:', error);
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

  shareList(list: TodoList) {
    this.sharingList = list;
    this.showShareModal = true;
  }

  confirmShare() {
    if (!this.shareEmail.trim() || !this.sharingList) return;

    this.todoListService.shareList(this.sharingList.id!, this.shareEmail.trim()).then(() => {
      this.showShareModal = false;
      this.shareEmail = '';
      this.sharingList = null;
    }).catch((error: any) => {
      console.error('Error sharing list:', error);
    });
  }

  cancelShare() {
    this.showShareModal = false;
    this.shareEmail = '';
    this.sharingList = null;
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
} 