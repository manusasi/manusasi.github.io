import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TodoListService } from './todo-list.service';
import { TodoService } from './todo.service';
import { TodoList } from './todo-list.model';
import { Todo } from './todo.model';
import { take } from 'rxjs';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo.component.html',
})
export class TodoComponent implements OnInit {
  todoList: TodoList | null = null;
  todos: Todo[] = [];
  isLoading = true;
  error: string | null = null;
  newTodoText = '';
  isAdding = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private todoListService: TodoListService,
    private todoService: TodoService
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
    // Implement edit list logic or open a modal
    alert('Edit list feature coming soon!');
  }

  shareList() {
    // Implement share list logic or open a modal
    alert('Share list feature coming soon!');
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
} 