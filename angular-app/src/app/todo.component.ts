import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Todo } from './todo.model';
import { TodoService } from './todo.service';
import { TodoListService } from './todo-list.service';
import { Observable, switchMap } from 'rxjs';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { TodoList } from './todo-list.model';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DragDropModule],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {
  todos$: Observable<Todo[]>;
  todos: Todo[] = [];
  newTodoTitle = '';
  editingTodo: Todo | null = null;
  originalTitle = '';
  currentList$: Observable<TodoList | null>;
  listId: string | null = null;

  constructor(
    private todoService: TodoService, 
    private todoListService: TodoListService,
    private route: ActivatedRoute
  ) {
    this.todos$ = new Observable();
    this.currentList$ = new Observable();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.listId = params['id'];
      if (this.listId) {
        this.todos$ = this.todoService.getTodosForList(this.listId);
        this.todos$.subscribe(todos => this.todos = todos);
        
        // Get the current list details
        this.currentList$ = this.todoListService.getLists().pipe(
          switchMap(lists => {
            const list = lists.find(l => l.id === this.listId);
            return new Observable<TodoList | null>(observer => {
              observer.next(list || null);
              observer.complete();
            });
          })
        );
      }
    });
  }

  drop(event: CdkDragDrop<Todo[]>) {
    moveItemInArray(this.todos, event.previousIndex, event.currentIndex);
    this.todoService.updateTodoPosition(this.todos);
  }

  addTodo(): void {
    if (this.newTodoTitle.trim() && this.listId) {
      this.todoService.addTodo(this.listId, this.newTodoTitle.trim()).subscribe({
        next: () => {
          this.newTodoTitle = '';
        },
        error: (err) => {
          console.error('Error adding todo:', err);
        }
      });
    }
  }

  toggleCompletion(todo: Todo): void {
    this.todoService.updateTodo({ ...todo, completed: !todo.completed });
  }

  editTodo(todo: Todo): void {
    this.editingTodo = { ...todo };
    this.originalTitle = todo.title;
  }

  saveTodo(): void {
    if (this.editingTodo) {
      if (this.editingTodo.title.trim()) {
        this.todoService.updateTodo(this.editingTodo);
        this.editingTodo = null;
      }
    }
  }

  cancelEdit(): void {
    this.editingTodo = null;
  }

  deleteTodo(id: string | undefined): void {
    if (id) {
      this.todoService.deleteTodo(id);
    }
  }

  // Removed logout() and backToLists() methods as navigation is now handled by main app component
} 