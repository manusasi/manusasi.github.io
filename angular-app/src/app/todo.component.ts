import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TodoListService } from './todo-list.service';
import { TodoService } from './todo.service';
import { TodoList } from './todo-list.model';
import { Todo } from './todo.model';
import { take } from 'rxjs';
import { ListEditShareModalComponent } from './list-edit-share-modal.component';
import { AuthService } from './auth.service';
import { BreadcrumbComponent, BreadcrumbItem } from './breadcrumb.component';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule, ListEditShareModalComponent, BreadcrumbComponent],
  templateUrl: './todo.component.html',
})
export class TodoComponent implements OnInit {
  todoList: TodoList | null = null;
  todos: Todo[] = [];
  isLoading = true;
  error: string | null = null;
  newTodoText = '';
  isAdding = false;
  showEditShareModal = false;
  modalMode: 'edit' | 'share' = 'edit';
  ownerName: string = '';
  breadcrumbItems: BreadcrumbItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private todoListService: TodoListService,
    private todoService: TodoService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const listId = this.route.snapshot.paramMap.get('id');
    if (listId) {
      this.isLoading = true;
      this.error = null;
      
      console.log('Loading todos for list ID:', listId);
      
      // First check authentication
      this.todoListService['authService'].user$.pipe(take(1)).subscribe(user => {
        console.log('Current user when loading todos:', user);
        if (!user) {
          this.error = 'Please log in to view todos.';
          this.isLoading = false;
          return;
        }
        
        this.todoListService.getLists().subscribe({
          next: (lists) => {
            console.log('All lists loaded:', lists);
            this.todoList = lists.find(l => l.id === listId) || null;
            if (!this.todoList) {
              this.error = 'Todo list not found or you do not have access to it.';
              this.isLoading = false;
              return;
            }
            
            console.log('Found todo list:', this.todoList);
            
            // Update breadcrumbs
            this.updateBreadcrumbs(this.todoList);
            
            // Get the owner name
            this.getOwnerName(this.todoList.owner);
            
            // Check access before loading todos
            this.todoListService.hasAccess(listId).then(hasAccess => {
              console.log('User has access to list:', hasAccess);
              if (!hasAccess) {
                this.error = 'You do not have permission to view this list.';
                this.isLoading = false;
                return;
              }
              
              this.todoService.getTodosForList(listId).subscribe({
                next: (todos) => {
                  console.log('Todos loaded successfully:', todos);
                  this.todos = todos;
                  this.isLoading = false;
                },
                error: (error) => {
                  console.error('Error loading todos:', error);
                  console.error('Error details:', {
                    code: error.code,
                    message: error.message,
                    details: error.details
                  });
                  
                  let errorMessage = 'Failed to load todos. ';
                  if (error.code === 'permission-denied') {
                    errorMessage += 'You may not have permission to view todos in this list.';
                  } else if (error.code === 'unauthenticated') {
                    errorMessage += 'Please log in to view todos.';
                  } else {
                    errorMessage += 'Please try again later.';
                  }
                  
                  this.error = errorMessage;
                  this.isLoading = false;
                }
              });
            }).catch(error => {
              console.error('Error checking access:', error);
              this.error = 'Failed to verify access to this list.';
              this.isLoading = false;
            });
          },
          error: (error) => {
            console.error('Error loading todo list:', error);
            this.error = 'Failed to load todo list.';
            this.isLoading = false;
          }
        });
      });
    } else {
      this.error = 'No list ID provided.';
      this.isLoading = false;
    }
  }

  updateBreadcrumbs(todoList: TodoList): void {
    this.breadcrumbItems = [
      {
        label: 'Home',
        route: '/',
        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
      },
      {
        label: 'Lists',
        route: '/lists',
        icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
      },
      {
        label: todoList.title,
        icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
      }
    ];
  }

  get completedCount(): number {
    return this.todos.filter(t => t.completed).length;
  }

  get completionPercentage(): number {
    if (!this.todos.length) return 0;
    return Math.round((this.completedCount / this.todos.length) * 100);
  }

  trackByTodo(index: number, todo: Todo) {
    return todo.id;
  }

  addTodo() {
    if (!this.newTodoText.trim() || !this.todoList) return;
    this.isAdding = true;
    this.todoService.addTodo(this.todoList.id!, this.newTodoText.trim()).subscribe({
      next: () => {
        this.newTodoText = '';
        this.isAdding = false;
      },
      error: () => {
        this.error = 'Failed to add todo.';
        this.isAdding = false;
      }
    });
  }

  toggleTodo(todo: Todo) {
    if (!todo.id) return;
    this.todoService.updateTodo({ ...todo, completed: !todo.completed }).catch(() => {
      this.error = 'Failed to update todo.';
    });
  }

  updateTodoText(todo: Todo, event: any) {
    const newText = event.target.value.trim();
    if (!todo.id || !newText || newText === todo.title) return;
    this.todoService.updateTodo({ ...todo, title: newText }).catch(() => {
      this.error = 'Failed to update todo text.';
    });
  }

  deleteTodo(todo: Todo) {
    if (!todo.id) return;
    this.todoService.deleteTodo(todo.id).catch(() => {
      this.error = 'Failed to delete todo.';
    });
  }

  goBack() {
    this.router.navigate(['/lists']);
  }

  editList() {
    this.modalMode = 'edit';
    this.showEditShareModal = true;
  }

  shareList() {
    this.modalMode = 'share';
    this.showEditShareModal = true;
  }

  closeModal() {
    this.showEditShareModal = false;
  }

  handleSaveEdit({ title, description }: { title: string; description: string }) {
    if (!this.todoList) return;
    const updatedList: TodoList = {
      ...this.todoList,
      title,
      description: description || undefined
    };
    this.todoListService.updateList(updatedList).then(() => {
      this.todoList = updatedList;
      this.closeModal();
    });
  }

  handleShare(email: string) {
    if (!this.todoList) return;
    this.todoListService.shareList(this.todoList.id!, email).then(() => {
      // Optionally update local state
      this.closeModal();
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard:', text);
    });
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

  getOwnerName(ownerId: string): void {
    // Try to get the current user first (if it's the current user)
    this.authService.user$.pipe(take(1)).subscribe(currentUser => {
      if (currentUser && currentUser.uid === ownerId) {
        this.ownerName = currentUser.displayName || currentUser.email || 'Unknown User';
        return;
      }
      
      // If it's not the current user, we'll show a generic name for now
      // In a real app, you might want to store user profiles in Firestore
      this.ownerName = 'Unknown User';
    });
  }
} 