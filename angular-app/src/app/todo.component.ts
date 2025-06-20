import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Todo } from './todo.model';
import { TodoService } from './todo.service';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

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

  constructor(private todoService: TodoService, private authService: AuthService) {
    this.todos$ = this.todoService.getTodos();
    this.todos$.subscribe(todos => this.todos = todos);
  }

  ngOnInit(): void {}

  drop(event: CdkDragDrop<Todo[]>) {
    moveItemInArray(this.todos, event.previousIndex, event.currentIndex);
    this.todoService.updateTodoPosition(this.todos);
  }

  addTodo(): void {
    if (this.newTodoTitle.trim()) {
      this.todoService.addTodo(this.newTodoTitle.trim()).subscribe({
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

  logout(): void {
    this.authService.signOut();
  }
} 